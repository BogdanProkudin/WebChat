import express, { Request, Response, Errback } from 'express';
import mongoose, { Mongoose } from 'mongoose';
import cors from 'cors';
import * as UserController from './controllers/userController';
import * as ChatController from './controllers/chatController';
import { RegistrValdation } from './vlidations/validation';
import { Server } from 'socket.io';
import http from 'http';
import multer, { StorageEngine } from 'multer';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ChatModel } from './Models/chatModel';
import { UserModel } from './Models/userModel';
import path from 'path';
import authenticateAndAuthorize from './utils/GetUser';
import { MessageModel } from './Models/messageModel';
import { log } from 'console';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, 'uploads'); // Папка, куда будут сохраняться файлы
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cors());
mongoose
  .connect(
    'mongodb+srv://quard:Screaper228@cluster0.zyg0fil.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => {
    console.log('BD Ok');
  })
  .catch(err => {
    console.log('BD BAD', err);
  });

app.post('/Registration', RegistrValdation, UserController.Registration);
app.post('/Login', UserController.Login);
app.post('/getToken', UserController.getToken);
app.post('/CreateChat', authenticateAndAuthorize, ChatController.createChat);
app.post('/SendMessage', authenticateAndAuthorize, ChatController.createMessage);
app.post('/AddFriend', authenticateAndAuthorize, UserController.AddFriend);
app.post('/RemoveFriend', authenticateAndAuthorize, UserController.removeFriend);
app.get('/Friends', authenticateAndAuthorize, UserController.GetFriends);
app.get('/searchUsers', authenticateAndAuthorize, UserController.getUsers);
app.post('/joinToChat', ChatController.userJoinChat);
app.get('/getMessages', ChatController.getMessages);
app.post('/UploadAvatar', upload.single('avatar'), UserController.UploadAvatar);
app.put('/mark-all-messages-as-read', ChatController.AllMessagesAsRead);
UserController.initialize(io);
ChatController.initialize(io);
const activeUsers: any = [];
const activeChats = new Map();
let CurrentChatId = '';
io.on('connection', socket => {
  console.log('New client connected', socket.id);

  // socket.on('userJoinedChat', async params => {
  //   const chat = await ChatModel.findById(params.chatId);
  //   CurrentChatId = params.chatId;

  //   if (!chat) {
  //     return;
  //   }
  //   if (!chat.activeUsers.includes(params.userId)) {
  //     chat.activeUsers.push(params.userId);
  //   }

  //   await chat.save();
  //   socket.to(params.chatId).emit('updateActiveUsers', chat.activeUsers);
  // });
  socket.on('joinChat', async ({ chatId, userId }) => {
    socket.join(chatId);
    const user = await UserModel.findById(userId);
    CurrentChatId = chatId;
    if (!activeChats.has(chatId)) {
      activeChats.set(chatId, new Set());
    }
    activeChats.get(chatId).add(user?.userName);
    if (activeChats.get(chatId).size === 2) {
      console.log('2 юзера в чате');
      const users = Array.from(activeChats.get(chatId)); // Преобразуем Set в массив

      io.to(chatId).emit('twoUsersInChat', users); // Отправляем массив пользователей на фронтенд
    }
    console.log('active nig', activeChats);
  });
  socket.on('MessagesAsRead', async (chatId, userName, messages) => {
    const chat = await ChatModel.findById(chatId);

    if (chat) {
      for (const message of chat.messages) {
        if (message.isRead !== true && message.sender !== userName) {
          message.isRead = true;
        }
      }

      // Сохранить обновленный документ чата
      await chat.save();
      console.log(chat.messages);

      io.to(chatId).emit('UpdatedMessageAsRead', messages ? messages : chat.messages);
    }
  });
  socket.on('MessageAsReadWhen2Users', async (chatId, userName) => {
    const chat = await ChatModel.findById(chatId);
    if (chat) {
      for (const message of chat.messages) {
        if (message.isRead !== true && message.sender !== userName) {
          message.isRead = true;
        }
      }
      await chat.save();
      console.log('Сохранил');
      console.log(chat?.messages);
    }
  });
  socket.on('SendMessage', async (chatId, message, userName) => {
    io.to(chatId).emit('gotMessage', message);
  });
  socket.on('leaveChat', async ({ chatId, userId, isDeletedChat }) => {
    const user = await UserModel.findById(userId);
    if (chatId.length === 0) {
      chatId = CurrentChatId;
    }
    if (isDeletedChat && activeChats.has(chatId)) {
      console.log('удалили и отчистил');

      activeChats.delete(chatId);
    }
    console.log('выешл на бэке ', chatId);
    if (activeChats.has(chatId)) {
      activeChats.get(chatId).delete(user?.userName);

      if (activeChats.get(chatId).size === 0) {
        activeChats.delete(chatId);
      }
      io.to(chatId).emit('userLeftChatt', { users: activeChats, chatId });
      console.log('WHEN LEAVE', activeChats);
      socket.leave(chatId);
    }
  });

  // socket.on('userLeftChat', async params => {
  //   console.log(params);
  //   if (CurrentChatId) {
  //     if (params.chatId === '') {
  //       params.chatId = CurrentChatId;
  //     }

  //     console.log('CURRENT CHAT ID', CurrentChatId, 'FROM PARAMS', params.chatId);

  //     const chat = await ChatModel.findById(params.chatId);

  //     if (!chat) {
  //       return;
  //     }

  //     const userIndex = chat.activeUsers.indexOf(params.userId);

  //     if (userIndex !== -1) {
  //       chat.activeUsers.splice(userIndex, 1);
  //     }
  //     console.log('CHAT IN END', chat);

  //     await chat.save();
  //     socket.to(params.chatId).emit('updateActiveUsers', chat.activeUsers);
  //   }
  // });
  // socket.on('markMessageAsRead', async (chatId, userName) => {
  //   try {
  //     const chat = await ChatModel.findById(chatId);
  //     if (chat) {
  //       for (const message of chat?.messages) {
  //         if (message.isRead !== true && message.sender !== userName) {
  //           message.isRead = true;
  //         }
  //       }
  //       await chat.save();
  //     }

  //     io.to(chatId).emit('updateMessageReadStatus', chat?.messages);
  //   } catch (error) {
  //     console.error('Error marking message as read:', error);
  //   }
  // });
  // socket.on('privateMessage', ({ chatId, sender, message }) => {
  //   // Отправьте сообщение всем участникам чата
  //   io.to(chatId).emit('receivePrivateMessage', { sender, message });
  // });
  socket.on('friendRemoved', async chatId => {});
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(3333, () => {
  try {
    return console.log('Server OK');
  } catch (err) {
    return console.log('Server bad');
  }
});
