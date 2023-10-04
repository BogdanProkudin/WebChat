import { ChangeEvent, Dispatch, SetStateAction, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setFindUserInput, setInputforSkeleton } from '../../redux/slices/Users';
type SideBarInputProps = {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  handleSearch: (value: string) => void;
};
const SidebarInput: React.FC<SideBarInputProps> = ({ searchTerm, setSearchTerm, handleSearch }) => {
  const dispatch = useAppDispatch();
  const userFindInput = useAppSelector(state => state.Users.findUserInput);
  const Change = React.useCallback(
    debounce((str: string) => {
      handleSearch(str);

      setSearchTerm(str);
    }, 700),

    []
  );
  const ChangeforSkeleton = React.useCallback(
    debounce(() => {
      dispatch(setInputforSkeleton(''));
    }, 1400),

    []
  );

  const ChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setFindUserInput(event.target.value));
    Change(event.target.value);
    ChangeforSkeleton();
    dispatch(setInputforSkeleton(event.target.value));
  };

  return (
    <div>
      <input
        value={userFindInput}
        onChange={e => ChangeInput(e)}
        className="SideBarInput"
        type="text"
        placeholder="Seach by name or email "
      />
    </div>
  );
};

export default SidebarInput;
