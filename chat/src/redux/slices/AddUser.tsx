import { AnyAction, PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

type ListItems = {
  nick: string;
  email: string;
};
type InitialState = {
  RegistrUserData: ListItems[];
  SignUpuserData: ListItems[];
};
const initialState: InitialState = {
  RegistrUserData: [],
  SignUpuserData: []
};
const AddUserSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    addUser: (state, actions: PayloadAction<ListItems[]>) => {
      state.RegistrUserData = actions.payload;
    },
    editUser: (state, actions: PayloadAction<ListItems[]>) => {
      state.SignUpuserData = actions.payload;
    }
  }
});
export const { addUser, editUser } = AddUserSlice.actions;

export default AddUserSlice.reducer;
