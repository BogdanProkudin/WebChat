import { useState } from 'react';
import { User } from './UserList';

const UserBlock: React.FC<User> = ({ userName, avatar }) => {
  return (
    <div key={userName} className={'bg-user'}>
      <img className="userImage" src={`data:${avatar}`} />
      <p className="userNick">{userName}</p>
    </div>
  );
};

export default UserBlock;
