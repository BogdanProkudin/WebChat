import { configureStore } from '@reduxjs/toolkit';
import User from '../redux/slices/AddUser';
import Users from './slices/Users';
import Chat from './slices/Chat';
import { auth } from './slices/Auth';
export const store = configureStore({
  reducer: { User, auth, Chat, Users }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
