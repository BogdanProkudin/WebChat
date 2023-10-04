import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import './Chat.scss';
import photo from '../icons/8726389_telegram_alt_icon.png';
import SideBar from '../SideBar/SideBar';
import ChatHeader from './ChatHeader';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import { useNavigate } from 'react-router-dom';
import UserInfoModal from './UserInfoModal';
import MessageError from './MessageError';
import useMediaQuery from '@mui/material/useMediaQuery';
import { setIsUserInfoOpen } from '../../redux/slices/Users';

const Chat: React.FC = () => {
  const isUserInfoOpen = useAppSelector(state => state.Users.IsUserInfoOpen);
  const friends = useAppSelector(state => state.Chat.friends);
  const inChat = useAppSelector(state => state.Chat.inChat);
  const navigate = useNavigate();
  const [messageContent, setMessageContent] = useState<string>('');
  const dispatch = useAppDispatch();
  const [chatHeight, setChatHeight] = useState<number>();
  const isCurrentUserString: any = localStorage.getItem('CurrentUser');
  const isCurrentUser = JSON.parse(isCurrentUserString);
  const ChatId = useAppSelector(state => state.Chat.chatId);
  const Companion = useAppSelector(state => state.Chat.Companion);
  const UserModalRef = useRef<HTMLDivElement | null>(null);
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  const [notification, setNotification] = useState({ visible: false, message: '' });

  const activeUsers = useAppSelector(state => state.Chat.activeUsers);
  const ChatWindowRef = useRef<HTMLUListElement>(null);

  // Функция для показа уведомления
  const showNotification = (Newmessage: any) => {
    setNotification({ visible: true, message: Newmessage });

    setTimeout(() => {
      setNotification({ visible: false, message: '' });
    }, 3000);
  };

  useEffect(() => {
    if (!inChat) {
      navigate('/Chat');
    }
  }, []);

  // На клиенте

  const getMessageFromInput = (e: ChangeEvent<HTMLTextAreaElement>, Ref: any) => {
    e.preventDefault();
    setMessageContent(e?.currentTarget?.value);
    const textarea = Ref.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Сбросить высоту
      textarea.style.height = `${textarea.scrollHeight}px`; // Установить высоту
      textarea.style.overflow = textarea.scrollHeight > 200 ? 'auto' : 'hidden';
    }
  };

  useEffect(() => {
    const handlerClick = (event: MouseEvent) => {
      if (UserModalRef.current !== null && event.composedPath().includes(UserModalRef.current)) {
        dispatch(setIsUserInfoOpen(false));
      }
    };

    document.body.addEventListener('click', handlerClick);

    return () => {
      document.body.removeEventListener('click', handlerClick);
    };
  }, []);

  return (
    <>
      {/* //smallScreen */}
      {inChat && isSmallScreen ? (
        <div style={{ height: chatHeight !== undefined ? chatHeight + 158 : '' }} className="chat">
          {isUserInfoOpen && isSmallScreen && <UserInfoModal UserModalRef={UserModalRef} />}
          {!inChat ? (
            <div>
              <img className="overlay" src={photo} alt="Overlay" />
            </div>
          ) : (
            <div>
              <ChatWindow
                messageContent={messageContent}
                getMessageFromInput={getMessageFromInput}
                setMessageContent={setMessageContent}
                ChatWindowRef={ChatWindowRef}
                setChatHeight={setChatHeight}
                showNotification={showNotification}
              />
            </div>
          )}
        </div>
      ) : (
        <SideBar />
      )}
      {/* defaultScreen */}

      {!isSmallScreen ? (
        <>
          {isUserInfoOpen && <UserInfoModal UserModalRef={UserModalRef} />}
          <div className="chat">
            <SideBar />
            {!inChat ? (
              <div>
                {notification.visible && (
                  <MessageError isError={false} message={notification.message} />
                )}

                <img className="overlay" src={photo} alt="Overlay" />
              </div>
            ) : (
              <div style={{ marginLeft: '300px' }}>
                <ChatWindow
                  messageContent={messageContent}
                  getMessageFromInput={getMessageFromInput}
                  setMessageContent={setMessageContent}
                  ChatWindowRef={ChatWindowRef}
                  setChatHeight={setChatHeight}
                  showNotification={showNotification}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default Chat;
