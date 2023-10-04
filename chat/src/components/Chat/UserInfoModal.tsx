import React, { Dispatch, RefObject, SetStateAction } from 'react';
import '../SideBar/SideBar.scss';
import { useAppSelector } from '../../redux/hooks';
interface UserModalProps {
  UserModalRef: any;
}
const UserInfoModal: React.FC<UserModalProps> = ({ UserModalRef }) => {
  const isCurrentUserString: any = localStorage.getItem('CurrentUser');
  const isCurrentUser = JSON.parse(isCurrentUserString);
  const isUserInfoOpen = useAppSelector(state => state.Users.IsUserInfoOpen);

  return (
    <>
      <div className="UserInfoModal">
        <div className="UserInfoModalItems">
          <h1 className="UserInfoModalItem">{`Email:${isCurrentUser.email}`}</h1>
          <h1 className="UserInfoModalItem">{`Name:${isCurrentUser.userName}`}</h1>
        </div>
        <h1 className="UserInfoModalItem">{`Password:${isCurrentUser.password}`}</h1>
      </div>
      <div ref={UserModalRef} className={isUserInfoOpen ? 'over' : ''}></div>
    </>
  );
};

export default UserInfoModal;
