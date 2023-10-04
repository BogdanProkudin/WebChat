import deleteFriend from '../icons/8037641.png';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setFriends, setInChat, setShowModal } from '../../redux/slices/Chat';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import arrowBack from '../icons/4829870_arrow_back_left_icon.png';

import socket from '../../socket/socket';
import useMediaQuery from '@mui/material/useMediaQuery';
type ChatHeaderProps = {
  showNotification: (param: string) => void;
};
const ChatHeader: React.FC<ChatHeaderProps> = ({ showNotification }) => {
  const companion = useAppSelector(state => state.Chat.Companion);
  const friends = useAppSelector(state => state.Chat.friends);
  const dispatch = useAppDispatch();

  const isCurrentUserString: any = localStorage.getItem('CurrentUser');
  const isCurrentUser = JSON.parse(isCurrentUserString);
  const currentFriend = friends.find(friend => friend.userName === companion);

  const token = localStorage.getItem('token');
  const ChatId: string = useAppSelector(state => state.Chat.chatId);
  const isSmallScreen = useMediaQuery('(max-width: 600px)');

  const removeFriend = async () => {
    const currentFriend = friends.filter(friend => {
      if (friend.userName === companion) {
        return friend._id;
      }
    });
    const friendId = currentFriend.find(el => el._id)?._id;
    console.log('CHATID', ChatId);

    // Выполните логику удаления друга на сервере
    await axios.post(
      'http://localhost:3333/RemoveFriend',
      { friendId, ChatId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    const updatedFriends = friends.filter(friend => {
      return friend.userName !== companion;
    });
    dispatch(setFriends(updatedFriends));
    dispatch(setInChat(false));
    dispatch(setShowModal(true));
    showNotification('Чат Успешно удален');
    await socket.emit('leaveChat', {
      chatId: ChatId,
      userId: isCurrentUser._id,
      isDeletedChat: true
    });
  };
  function LeaveChatOnSmallScreen() {
    dispatch(setInChat(false));
    socket.emit('leaveChat', { chatId: ChatId, userId: isCurrentUser._id });
  }
  return (
    <div>
      <div className="ChatHeaderFlex">
        {isSmallScreen && (
          <img className="arrowBack" onClick={LeaveChatOnSmallScreen} src={arrowBack}></img>
        )}
        <p className="ChatUserNickname">{companion}</p>
        <div className="iconWrapper">
          <button className="RemoveFriendButton">
            <img onClick={removeFriend} className="RemoveFriendImage" src={deleteFriend} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
