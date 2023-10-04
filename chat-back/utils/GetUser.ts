import { Request, Response } from 'express';
import { UserModel } from '../Models/userModel';
import jwt from 'jsonwebtoken';
declare global {
  namespace Express {
    interface Request {
      userId?: any; // Используйте здесь свой собственный тип для пользователя
    }
  }
}
const authenticateAndAuthorize = async (req: Request, res: Response, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Отсутствует токен авторизации' });
    }

    const decoded = jwt.verify(token, 'bodya') as any;

    const userId = decoded.id;

    if (!userId) {
      res.status(401).json({ message: 'Юзер не найден' });
    }

    req.userId = userId;
    // Присваиваем объект пользователя к объекту запроса
    next(); // Передаем управление следующему middleware или маршруту
  } catch (error) {
    console.error('Ошибка при аутентификации и авторизации', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

export default authenticateAndAuthorize;
