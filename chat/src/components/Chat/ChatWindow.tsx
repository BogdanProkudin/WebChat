import React, {
  ChangeEvent,
  Dispatch,
  MutableRefObject,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import socket from '../../socket/socket';
import { setAllinChat, setMessages } from '../../redux/slices/Chat';
import { motion, AnimatePresence } from 'framer-motion';

type ChatWindowProps = {
  messageContent: string;
  getMessageFromInput: (e: ChangeEvent<HTMLTextAreaElement>, Ref: any) => void;
  setMessageContent: Dispatch<SetStateAction<string>>;
  ChatWindowRef?: RefObject<HTMLUListElement> | null;
  setChatHeight: Dispatch<SetStateAction<number | undefined>>;
  showNotification: (params: string) => void;
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  getMessageFromInput,
  messageContent,
  setMessageContent,
  ChatWindowRef,
  setChatHeight,
  showNotification
}) => {
  const ChatMessages = useAppSelector(state => state.Chat.Messages);
  const isCurrentUser = JSON.parse(localStorage.getItem('CurrentUser') || '{}');
  const ChatId = useAppSelector(state => state.Chat.chatId);
  const MemoizedChatHeader = React.memo(ChatHeader);
  const Companion = useAppSelector(state => state.Chat.Companion);

  const dispatch = useAppDispatch();

  const handleBeforeUnload = useCallback(
    async (event: BeforeUnloadEvent) => {
      event.preventDefault();
      await socket.emit('leaveChat', { chatId: ChatId, userId: isCurrentUser._id });
    },
    [ChatId, isCurrentUser._id]
  );

  const handleGotMessage = useCallback(
    (message: any) => {
      dispatch(setMessages([...ChatMessages, message]));
    },
    [ChatMessages]
  );

  const handleUserLeftChat = useCallback(() => {
    dispatch(setAllinChat(false));
  }, [dispatch]);

  const handleTwoUsersInChat = useCallback(() => {
    dispatch(setAllinChat(true));
  }, [dispatch]);

  useEffect(() => {
    setChatHeight(ChatWindowRef?.current?.offsetHeight);
  }, [ChatWindowRef?.current?.offsetHeight]);

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  useEffect(() => {
    socket.on('gotMessage', handleGotMessage);

    return () => {
      socket.off('gotMessage', handleGotMessage);
    };
  }, [handleGotMessage]);

  useEffect(() => {
    socket.on('userLeftChatt', handleUserLeftChat);

    return () => {
      socket.off('userLeftChatt', handleUserLeftChat);
    };
  }, [handleUserLeftChat]);

  useEffect(() => {
    socket.on('twoUsersInChat', handleTwoUsersInChat);

    return () => {
      socket.off('twoUsersInChat', handleTwoUsersInChat);
    };
  }, [handleTwoUsersInChat]);

  const unreadMessagesExist = useMemo(() => {
    return ChatMessages.some(message => message.isRead === false);
  }, [ChatMessages]);

  useEffect(() => {
    if (unreadMessagesExist) {
      socket.on('UpdatedMessageAsRead', Messages => {
        console.log('изменения', Messages);

        const newArr = Messages.map((el: any) => {
          if (el.isRead === false) {
            const newObj = { ...el, isRead: true };
            return newObj;
          }
          return el;
        });

        dispatch(setMessages(newArr));
        socket.emit('MessageAsReadWhen2Users', ChatId, isCurrentUser.userName);
      });
    }
  }, [unreadMessagesExist, dispatch]);

  return (
    <AnimatePresence>
      <motion.span
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <MemoizedChatHeader showNotification={showNotification} />
          <ul ref={ChatWindowRef} className="ChatWindowMain">
            {ChatMessages.map((message, index) => {
              const isCurrentUserMessage = isCurrentUser.userName === message.sender;
              const readIndicatorClass = message.isRead
                ? 'read-indicator'
                : 'read-indicator hidden';

              return (
                <li
                  key={index}
                  className={!isCurrentUserMessage ? 'currentUserMessage' : 'otherUserMessage'}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      minWidth: '60px',
                      maxWidth: '100%'
                    }}
                  >
                    <p className="message">{message.content}</p>
                    <AnimatePresence>
                      {message.isRead && (
                        <motion.span
                          style={{ color: 'green' }}
                          className={readIndicatorClass}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          &#10003; &#10003;
                        </motion.span>
                      )}
                      {!message.isRead && <span className={readIndicatorClass}>&#10003;</span>}
                    </AnimatePresence>
                  </div>
                </li>
              );
            })}
          </ul>
          <ChatInput
            setMessageContent={setMessageContent}
            messageContent={messageContent}
            getMessageFromInput={getMessageFromInput}
          />
        </div>
      </motion.span>
    </AnimatePresence>
  );
};

export default ChatWindow;
