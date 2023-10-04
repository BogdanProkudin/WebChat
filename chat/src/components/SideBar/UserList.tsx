import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import UserBlock from './UserBlock';
import axios from 'axios';
import socket from '../../socket/socket';
import {
  createChat,
  setChatId,
  setCompanion,
  setFriends,
  setInChat,
  setMessages
} from '../../redux/slices/Chat';
import { AnimatePresence, motion } from 'framer-motion';

export type User = {
  _id?: string;
  userName: string;
  data?: object[] | number;
  avatar: string;
};

type UserListProps = {};

const UserList: React.FC<UserListProps> = () => {
  const dispatch = useAppDispatch();
  const [userIndex, setUserIndex] = useState<number | null>(null);
  const isCurrentUserString: any = localStorage.getItem('CurrentUser');
  const isCurrentUser = JSON.parse(isCurrentUserString);
  const ChatId = useAppSelector(state => state.Chat.chatId);
  const friends = useAppSelector(state => state.Chat.friends);
  const ChatMessages = useAppSelector(state => state.Chat.Messages);
  const messageId = useAppSelector(state => state.Chat.messageId);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('http://localhost:3333/Friends', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => {
        dispatch(setFriends(response.data));
      })
      .catch(error => {
        console.error('Ошибка при получении списка друзей:', error);
      });
  }, []);

  const handleInChatButtonClick = async (obj: User, index: number, FriendArr: User[]) => {
    const objectfalseproperty = ChatMessages.filter(el => el.isRead === false);
    const response = await dispatch(createChat(obj));
    console.log(response.payload, 'RESPONSE ON FRONT');
    if (ChatId.length !== 0 && ChatId !== response.payload.chat._id) {
      socket.emit('leaveChat', { chatId: ChatId, userId: isCurrentUser._id });
    }

    socket.emit('joinChat', { chatId: response.payload.chat._id, userId: isCurrentUser._id });

    setUserIndex(index);
    dispatch(setInChat(true));
    dispatch(setCompanion(FriendArr[index].userName));
    dispatch(setChatId(response.payload.chat._id));
    if (response.payload.lastMessage) {
      if (response.payload.lastMessage.sender !== isCurrentUser.userName) {
        console.log('here');

        socket.emit('MessagesAsRead', response.payload.chat._id, isCurrentUser.userName);
      }
    }
  };

  socket.on('friendRemoved', params => {
    const updatedFriends = friends.filter(friend => {
      return friend.userName !== params.companion;
    });

    dispatch(setFriends(updatedFriends));
    dispatch(setInChat(false));
  });

  return (
    <div>
      {friends.map((obj, index, FriendArr) => (
        <div key={index}>
          <AnimatePresence>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                style={{
                  backgroundColor: userIndex === index ? 'rgb(134, 201, 235)' : 'rgb(222, 228, 231)'
                }}
                onClick={() => handleInChatButtonClick(obj, index, FriendArr)}
                key={index}
              >
                <UserBlock userName={obj.userName} avatar={obj.avatar} />
              </div>
            </motion.span>
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default UserList;
