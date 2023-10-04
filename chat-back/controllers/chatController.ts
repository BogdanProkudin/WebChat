import { ChatModel } from '../Models/chatModel';
import { Server } from 'socket.io';
import http from 'http';
import express, { Request, Response, Errback } from 'express';
import jwt from 'jsonwebtoken';
import { MessageModel } from '../Models/messageModel';
import { UserModel } from '../Models/userModel';
import { body } from 'express-validator';
// Обработчик для создания чата с сообщениями
let io: any;
export const initialize = (ioInstance: any) => {
  io = ioInstance;
};
export const createChat = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const currentUser = await UserModel.findById(userId);

    const findedUser = await req.body.members.userName;
    const members = [currentUser?.userName, findedUser];

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Проверяем, что участники чата существуют в базе данных
    const areMembersValid = await UserModel.find({
      userName: { $in: members.map((participant: any) => participant) }
    });

    // Если не все участники существуют, возвращаем ошибку
    if (areMembersValid.length !== members.length) {
      return res.status(404).json({ message: 'Some participants are not found' });
    }

    // Создаем массив объектов участников чата с их id и именами
    const participantsData = areMembersValid.map(user => ({
      id: user._id,
      userName: user.userName
    }));

    // Проверяем, существует ли уже чат между текущим пользователем и участниками чата
    const existingChat = await ChatModel.findOne({
      members: {
        $in: [participantsData.map(p => p.userName)]
      }
    });

    if (existingChat) {
      // Если чат уже существует, возвращаем его в ответе
      for (const user of existingChat.activeUsers) {
        io.to(user).emit('userJoinedChat', { chatId: existingChat._id });
      }
      const lastMessage = existingChat && existingChat.messages[existingChat.messages.length - 1];
      return res.status(200).json({ chat: existingChat, lastMessage });
    }

    // Если чат не существует, создаем новый чат с участниками
    const newChat = new ChatModel({
      members: [participantsData.map(p => p.userName)],
      messages: [],
      activeUsers: []
    });

    // Сохраняем новый чат в базе данных
    const savedChat = await newChat.save();
    for (const user of savedChat.activeUsers) {
      io.to(user).emit('userJoinedChat', { chatId: savedChat._id });
    }
    // Возвращаем новый чат в ответе
    console.log(savedChat);

    return res.status(200).json({ chat: savedChat });
  } catch (err) {
    console.error('Error creating chat', err);
    return res.status(500).json({ message: 'Ошибка на стороне бэка при создании чата' });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const userId: any = req.userId;
    const currentChat: any = await ChatModel.findById(req.body.chat);
    const sender = await UserModel.findById(userId);

    // Создаем новое сообщение
    const newMessage = await new MessageModel({
      sender: sender?.userName,
      content: req.body.message,
      chat: req.body.chat,
      time: new Date(),
      isRead: false
    });

    await currentChat?.messages.push({
      sender: newMessage.sender,
      content: newMessage.content,

      time: newMessage.time,
      isRead: false
    });

    // Сохраняем сообщение в базе данных
    const savedMessage = await newMessage.save();

    await currentChat.save();
    return res.status(200).json(savedMessage);
  } catch (error) {
    console.error('Error saving message', error);
    return res.status(500).json({ message: 'An error occurred' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const currentChat = await ChatModel.findById(req.query.id);

  if (!currentChat) {
    return res.status(500).json({ message: 'SOMEthing went wrong when tried get messages' });
  }
  return res.status(200).json(currentChat.messages);
};

export const AllMessagesAsRead = async (req: Request, res: Response) => {
  const chatId = req.body.chatId; // ID чата
  const userName = req.body.userName; // ID пользователя
  console.log(chatId);

  try {
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return res.status(400).json('не найден чат');
    }
    for (const message of chat.messages) {
      if (message.isRead !== true && message.sender !== userName) {
        message.isRead = true;
      }
    }

    // Сохранить обновленный документ чата
    await chat.save();

    res.json({ message: 'Все сообщения отмечены как прочитанные', chatMessages: chat.messages });
  } catch (error) {
    console.error('Ошибка при обновлении статуса прочтения сообщений', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const userJoinChat = async (req: Request, res: Response) => {
  const { chatId, userId } = req.body;

  try {
    const chat = await ChatModel.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Чат не найден' });
    }

    if (!chat.activeUsers.includes(userId)) {
      chat.activeUsers.push(userId);
    }

    await chat.save();

    res
      .status(200)
      .json({ message: 'Пользователь присоединен к чату', activeUsers: chat.activeUsers });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при присоединении к чату', error });
  }
};
