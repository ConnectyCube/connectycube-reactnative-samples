import { createSlice } from '@reduxjs/toolkit';

const currentUserInitialState = null;
const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState: currentUserInitialState,
  reducers: {
    setCurrentUser: (_, action) => action.payload,
    updateCurrentUser: (currentUser, action) => Object.assign(currentUser, { user: action.payload }),
    resetCurrentUser: () => currentUserInitialState,
  },
});

export const currentUser = currentUserSlice.reducer;
export const { setCurrentUser, updateCurrentUser, resetCurrentUser } = currentUserSlice.actions;
