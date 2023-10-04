type UserFindBtnProps = {
  handleSearch: (value: any) => void;
  searchTerm: string;
};
const UserFindBtn: React.FC<UserFindBtnProps> = ({ handleSearch, searchTerm }) => {
  return (
    <div className="newChatBtnParent">
      <button onClick={() => handleSearch(searchTerm)} className="FindUserBtn">
        Search
      </button>
    </div>
  );
};

export default UserFindBtn;
