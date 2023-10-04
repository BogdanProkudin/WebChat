import { validationResult } from 'express-validator';
import express, { Request, Response, Errback } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../Models/userModel';
import { isEmailTaken, isUserNameTaken } from '../services/userServices';
import mongoose from 'mongoose';
import http from 'http';
import { ChatModel } from '../Models/chatModel';
import path from 'path';
type UserData = {
  email: string;
  userName: string;
  password: string;
};
let io: any;
export const initialize = (ioInstance: any) => {
  io = ioInstance;
};
export const Registration = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const doc = new UserModel({
      email: req.body.email,
      userName: req.body.userName,
      password: req.body.password,
      avatar: req.body.avatar
    });
    const emailTaken = await isEmailTaken(doc.email);
    const userNameTaken = await isUserNameTaken(doc.userName);

    if (emailTaken || userNameTaken) {
      const errorResponse: { message: string; emailError?: string; userNameError?: string } = {
        message: 'Validation failed'
      };
      if (emailTaken) {
        errorResponse.emailError = 'Email already taken';
      }
      if (userNameTaken) {
        errorResponse.userNameError = 'UserName already taken';
      }
      return res.status(400).json(errorResponse);
    }

    //  логика сохранения пользователя в базу данных
    const user = await doc.save();
    return res.status(200).json({ message: 'User registered successfully' });
  } catch (err) {
    console.log('register error', err);
  }
};

export const Login = async (req: Request, res: Response) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({
      message: 'Неверная почта или пароль'
    });
  }
  const isValidPass = (await req.body.password) === user.password;
  console.log('password is valid:', isValidPass);

  if (!isValidPass) {
    return res.json({ message: 'Неверная почта или пароль' });
  }
  const token = jwt.sign({ id: user._id.toJSON() }, 'bodya', { expiresIn: '30d' });
  return res.status(200).json({ message: 'User Login successfully', token, user });
};

export const getToken = async (req: Request, res: Response) => {
  // Проверка наличия и валидности почты и пароля
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user || req.body.password !== user.password) {
    return res.status(401).json({ message: 'Неверная почта или пароль' });
  }

  // Генерация и отправка токена
  const token = jwt.sign({ id: user._id }, 'bodya', { expiresIn: '1h' });
  return res.json({ token });
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const currentUserId: any = req.userId;
    const { query } = req.query; // Получаем параметр запроса 'query' из UR
    // Ищем пользователей, у которых ник содержит значение из запроса
    const foundUsers = await UserModel.find({
      userName: { $regex: query, $options: 'i' },
      _id: { $ne: currentUserId } // Исключаем текущего пользователя из результатов поиска
    });

    res.status(200).json(foundUsers);
  } catch (error) {
    console.error('Error searching users', error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

export const AddFriend = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    // Найдите пользователя по ID и добавьте друга по его username
    const user = await UserModel.findById(userId);
    const friend = await UserModel.findOne({ userName: req.body.findedUser.userName });

    if (!user) {
      return res.status(400).json({ message: 'не найден юзер' });
    }

    if (!friend) {
      return res.status(404).json({ message: 'Друг с таким именем не найден' });
    }

    if (user.friends.includes(friend._id)) {
      return res.json({ message: 'Этот пользователь уже является вашим другом' });
    }

    // Добавьте друга в список друзей текущего пользователя
    user.friends.push(friend._id);
    friend.friends.push(user._id);
    await user.save();
    await friend.save();
    io.emit('addFriend', { userName: user.userName, userId, avatar: user.avatar });

    return res.status(200).json({ message: 'Друг успешно добавлен' });
  } catch (error) {
    console.error('Ошибка при добавлении друга', error);
    return res.status(500).json({ message: 'Ошибка при добавлении друга' });
  }
};

export const GetFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findById(userId).populate({
      path: 'friends',
      select: ['userName', 'avatar']
    });

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    console.log('YA V FUNC');

    res.json(user.friends);
  } catch (error) {
    console.error('Ошибка при получении списка друзей', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export const removeFriend = async (req: Request, res: Response) => {
  try {
    const { friendId, ChatId } = req.body;
    const userId = req.userId;
    const currentChat = await ChatModel.findById(ChatId);

    // Выполните удаление чата для обоих участников
    // Например, используйте Mongoose для удаления чата из базы данных

    if (currentChat) {
      await currentChat.deleteOne();
    }

    // После удаления чата, отправьте событие обратно для обновления интерфейса

    const currentFriend = await UserModel.findByIdAndUpdate(
      friendId,
      { $pull: { friends: userId } },
      { new: true }
    );
    const currentUser = await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { friends: friendId } },
      { new: true }
    );
    io.emit('friendRemoved', {
      friendId,
      userId: userId,
      companion: currentUser?.userName
    });

    // Верните обновленные данные текущего пользователя
    return res.status(200).json({ currentUser, currentFriend });
  } catch (err) {
    console.error('Error removing friend', err);
    return res.status(500).json({ message: 'An error occurred' });
  }
};

export const UploadAvatar = async (req: Request, res: Response) => {
  const currentUser: any = req?.body?.isCurrentUser;

  const Image: any = req?.body?.image;
  console.log(req.body);

  const user = await UserModel.findOne({ userName: currentUser?.userName });

  if (!user) {
    return res.status(404).send('Пользователь не найден');
  }

  const imageUrl = `http://localhost:3333/${Image}`;
  user.avatar = imageUrl;
  await user.save();
  if (!Image) {
    return res.status(400).send('Invalid file type. Only images are allowed.');
  }
  res.status(200).json({ imageUrl, user });
  console.log('Avatar uploaded');
};
