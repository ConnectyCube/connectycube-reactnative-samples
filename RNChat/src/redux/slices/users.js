import { createSlice } from '@reduxjs/toolkit';
import { getFetchedUsers } from '../reducer-function';

const usersInitialState = {};
const usersSlice = createSlice({
  name: 'users',
  initialState: usersInitialState,
  reducers: {
    fetchUsers: (users, action) => getFetchedUsers(action.payload, users),
    resetUsers: () => usersInitialState,
  },
});

export const users = usersSlice.reducer;
export const { fetchUsers, resetUsers } = usersSlice.actions;
