import AddUser from '../icons/addUser.png';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createChat } from '../../redux/slices/Chat';
import { useState } from 'react';
type NewChatBtnProps = {
  isSideBarOpen: boolean;
  setIsSideBarOpen: (param: boolean) => void;
};
const NewChatBtn: React.FC<NewChatBtnProps> = ({ isSideBarOpen, setIsSideBarOpen }) => {
  const dispatch = useAppDispatch();

  const handleCreateChat = () => {
    setIsSideBarOpen(!isSideBarOpen);
  };
  return (
    <div className="newChatBtnParent">
      <img className="addUser" src={AddUser} />
      <button onClick={handleCreateChat} className="newChatBtn">
        New Chat
      </button>
    </div>
  );
};

export default NewChatBtn;
