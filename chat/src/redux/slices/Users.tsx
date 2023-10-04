import { createSlice } from '@reduxjs/toolkit';
type InitialState = {
  IsUserInfoOpen: boolean;
  skeletonInput: string;
  findUserInput: string;
};
const initialState: InitialState = {
  IsUserInfoOpen: false,
  skeletonInput: '',
  findUserInput: ''
};
const UserSlice = createSlice({
  name: 'User',
  initialState,
  reducers: {
    setIsUserInfoOpen: (state, actions) => {
      state.IsUserInfoOpen = actions.payload;
    },
    setInputforSkeleton: (state, action) => {
      state.skeletonInput = action.payload;
    },
    setFindUserInput: (state, action) => {
      state.findUserInput = action.payload;
    }
  }
});
export const { setIsUserInfoOpen, setInputforSkeleton, setFindUserInput } = UserSlice.actions;

export default UserSlice.reducer;
