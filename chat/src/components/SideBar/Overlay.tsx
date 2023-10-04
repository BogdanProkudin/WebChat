import React, { Dispatch, SetStateAction, useState } from 'react';
import SidebarInput from './SideBarInput';
import UserFindBtn from './UserFindBtn';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import UserBlock from './UserBlock';
import { useNavigate } from 'react-router-dom';
import { User } from './UserList';
import {
  createChat,
  setChatId,
  setFriends,
  setInChat,
  setShowModal
} from '../../redux/slices/Chat';
import socket from '../../socket/socket';
import axios, { AxiosError } from 'axios';
import UserSkeleton from './UserSkeleton';
import MessageError from '../Chat/MessageError';
import { setFindUserInput } from '../../redux/slices/Users';
type OverlayProps = {
  isSideBarOpen: boolean;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  handleSearch: (value: string) => void;
  searchResults: User[];
  isUserFounded: boolean | null;
};

const Overlay: React.FC<OverlayProps> = ({
  isSideBarOpen,
  searchTerm,
  setSearchTerm,
  handleSearch,
  searchResults,
  isUserFounded
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const token = localStorage.getItem('token');
  const skeletonInput = useAppSelector(state => state.Users.skeletonInput);
  const friends = useAppSelector(state => state.Chat.friends);
  const userFindInput = useAppSelector(state => state.Users.findUserInput);
  const [notification, setNotification] = useState({ visible: false, message: '' });
  const showNotification = (Newmessage: any) => {
    console.log('NEWMESSAGE', Newmessage);

    setNotification({ visible: true, message: Newmessage });

    setTimeout(() => {
      setNotification({ visible: false, message: '' });
    }, 3000);
  };
  async function CreateChat(findedUser: User) {
    try {
      const response = await axios.post(
        'http://localhost:3333/AddFriend',
        { findedUser },
        {
          headers: {
            Authorization: `Bearer ${token}` // Добавляем токен в заголовок запроса
          }
        }
      );

      // Если запрос выполнен успешно, обновляем состояние friends
      if (response.data.message === 'Друг успешно добавлен') {
        dispatch(setFriends([...friends, findedUser]));
        socket.emit('addFriend', findedUser);
        navigate('/');
        setSearchTerm('');
        dispatch(setFindUserInput(''));
      }
      if (response.data.message === 'Этот пользователь уже является вашим другом') {
        console.log('в ифе');
        dispatch(setShowModal(true));
        showNotification('User already your friend');
      }
      console.log(findedUser);
    } catch (error: any) {
      console.error('Ошибка при добавлении друга', error);
    }
  }
  socket.on('addFriend', friend => {
    dispatch(setFriends([...friends, friend]));
  });

  return (
    <div className="Parents">
      {/* Условный рендеринг боковой панели */}
      {isSideBarOpen && (
        <div className={`sidebar ${isSideBarOpen ? 'open' : ''}`}>
          {/* Содержимое боковой панели */}
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              borderBottom: '1px solid #E2E8F0',
              padding: '7px'
            }}
          >
            Add User
          </p>
          <div className="SideBarContainer">
            <SidebarInput
              handleSearch={handleSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
            <UserFindBtn searchTerm={searchTerm} handleSearch={handleSearch} />
          </div>
          <div style={{ marginLeft: '10px' }} className="FoundedUsers">
            {userFindInput.length !== 0 &&
              searchResults.length !== 0 &&
              skeletonInput.length === 0 &&
              searchResults.map(user => {
                return (
                  <div onClick={() => CreateChat(user)}>
                    <UserBlock avatar={user.avatar} userName={user.userName} />
                  </div>
                );
              })}
            {skeletonInput.length !== 0 &&
              [...new Array(6)].map((el, index) => {
                return <UserSkeleton />;
              })}
            {searchResults.length === 0 && userFindInput.length !== 0 && (
              <h1
                style={{
                  display: 'flex',
                  height: '55vh',
                  justifyContent: 'center',
                  marginRight: '40px',
                  fontSize: '30px',
                  alignItems: 'center',
                  fontWeight: '600',
                  color: '#00000'
                }}
              >
                Users not found 🙁
              </h1>
            )}
            {userFindInput.length === 0 && (
              <h1
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginRight: '40px',
                  fontSize: '30px',
                  fontWeight: '600',
                  color: '#00000'
                }}
              >
                Find a new Friend
              </h1>
            )}
            {notification.visible && <MessageError isError={true} message={notification.message} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overlay;

// searchResults.map((findedUser: User, index: number) => {
//   return (
//     <div key={index} onClick={() => CreateChat(findedUser)}>
//       <UserBlock
//         userName={findedUser.userName}
//         photo={'https://avatars.dicebear.com/api/bottts/Test.svg'}
//       />
//     </div>
//   );
// })
