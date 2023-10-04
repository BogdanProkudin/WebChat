import React, { ChangeEvent, Dispatch, MutableRefObject, SetStateAction, useRef } from 'react';
import sendImg from '../icons/1860497_send_social media_icon.png';
import axios from 'axios';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setMessages, setMessagesId } from '../../redux/slices/Chat';
import socket from '../../socket/socket';

export type ChatInputProps = {
  messageContent: string;
  getMessageFromInput: (
    e: ChangeEvent<HTMLTextAreaElement>,
    textareaRef: MutableRefObject<HTMLTextAreaElement | null>
  ) => void;
  setMessageContent: Dispatch<SetStateAction<string>>;
};

const ChatInput: React.FC<ChatInputProps> = ({
  messageContent,
  getMessageFromInput,
  setMessageContent
}) => {
  const token: string | null = localStorage.getItem('token');
  const ChatId: string = useAppSelector(state => state.Chat.chatId);
  const ChatMessages = useAppSelector(state => state.Chat.Messages);
  const allInChat = useAppSelector(state => state.Chat.allInChat);
  const isCurrentUserString: any = localStorage.getItem('CurrentUser');
  const isCurrentUser = JSON.parse(isCurrentUserString);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const dispatch = useAppDispatch();

  const sendMessage = async () => {
    if (!textareaRef.current) return;

    try {
      if (messageContent.length > 4096) {
        console.log('больше нормы');
        return;
      }
      const data = { message: messageContent, chat: ChatId };
      const response = await axios.post('http://localhost:3333/SendMessage', data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      dispatch(setMessagesId(response.data));
      if (allInChat) {
        socket.emit('SendMessage', ChatId, response.data);
        socket.emit('MessagesAsRead', ChatId, isCurrentUser.userName);
      }
      if (!allInChat) {
        dispatch(setMessages([...ChatMessages, response.data]));
      }
      setMessageContent('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения', error);
    }
  };

  return (
    <div className="ChatInputParent">
      <button onClick={sendMessage} className="sendMessageButton">
        <img src={sendImg} className="sendImg" alt="Send" />
      </button>
      <textarea
        rows={1}
        ref={textareaRef}
        value={messageContent}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => getMessageFromInput(e, textareaRef)}
        className="ChatInput"
        placeholder="Enter message here"
      />
    </div>
  );
};

export default ChatInput;
