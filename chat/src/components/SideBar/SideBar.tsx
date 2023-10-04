import '../SideBar/SideBar.scss';
import NewChatBtn from './NewChatBtn';
import { useNavigate } from 'react-router-dom';
import UserList, { User } from './UserList';
import Overlay from './Overlay';
import { useRef, useState } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setInChat } from '../../redux/slices/Chat';
import React, { useEffect } from 'react';
import socket from '../../socket/socket';
import UserInfoModal from '../Chat/UserInfoModal';
import useMediaQuery from '@mui/material/useMediaQuery';
import { setIsUserInfoOpen } from '../../redux/slices/Users';

type SideBarProps = {};

const SideBar: React.FC<SideBarProps> = () => {
  const token: string | null = localStorage.getItem('token');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isUserFounded, setIsUserFounded] = useState<boolean | null>(null);
  const [searchResults, setSearchResults] = useState<User[]>([]);

  const OverlayRef = useRef<HTMLDivElement | null>(null);
  const inChat = useAppSelector(state => state.Chat.inChat);
  const isCurrentUserString: any = localStorage.getItem('CurrentUser');
  const isCurrentUser = JSON.parse(isCurrentUserString);

  const isSmallScreen = useMediaQuery('(max-width: 600px)');

  const logOut = () => {
    localStorage.removeItem('token');
    window.history.replaceState({}, '', '/SignUp');
    dispatch(setInChat(false));
    navigate('/SignUp');
  };

  const handleSearch = async (value: string) => {
    try {
      const response = await axios.get(`http://localhost:3333/searchUsers?query=${value}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.length !== 0 && value.length !== 0) {
        setIsUserFounded(true);
        setSearchResults(response.data);
      } else {
        setIsUserFounded(false);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users', error);
    }
  };

  useEffect(() => {
    const handlerClick = (event: MouseEvent) => {
      if (OverlayRef.current && !event.composedPath().includes(OverlayRef.current)) {
        setIsSideBarOpen(false);
        setIsUserFounded(null);
        setSearchResults([]);
      }
    };

    document.body.addEventListener('click', handlerClick);

    return () => {
      document.body.removeEventListener('click', handlerClick);
    };
  }, []);

  return (
    <>
      <div className={isSideBarOpen ? 'over' : ''}>
        <div
          ref={OverlayRef}
          style={{ maxWidth: isSideBarOpen ? '450px' : '300px' }}
          className="Sidebar-bg"
        >
          <div className="SideBar-top">
            <div className="SideBar-top-Items">
              <img
                onClick={() => !isSmallScreen && dispatch(setIsUserInfoOpen(true))}
                className="profileImage"
                src={`data:${isCurrentUser.avatar}`}
                alt="Profile"
              />
              <span className="profileName">{isCurrentUser.userName}</span>
              <button onClick={logOut} type="button" className="LogOutBtn">
                <svg
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  className="logOutSvg"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  focusable="false"
                  aria-hidden="true"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
          <NewChatBtn setIsSideBarOpen={setIsSideBarOpen} isSideBarOpen={isSideBarOpen} />
          <div>
            <UserList />
            <Overlay
              searchResults={searchResults}
              handleSearch={handleSearch}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isSideBarOpen={isSideBarOpen}
              isUserFounded={isUserFounded}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
