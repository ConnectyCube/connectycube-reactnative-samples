import { createSlice } from '@reduxjs/toolkit';

const currentUserInitialState = null;

const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState: currentUserInitialState,
  reducers: {
    setCurrentUser: (_, action) => action.payload,
    resetCurrentUser: () => currentUserInitialState,
  },
});

export const currentUser = currentUserSlice.reducer;
export const { setCurrentUser, resetCurrentUser } = currentUserSlice.actions;
