import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { currentUser, resetCurrentUser } from '../redux/slices/currentUser';
import { appIsLoading, resetAppIsLoading } from '../redux/slices/app';
import { dialogs, resetDialogs } from '../redux/slices/dialogs';
import { messages, resetMessages } from '../redux/slices/messages';
import { users, resetUsers } from '../redux/slices/users';
import { selectedDialog, unselectDialog } from '../redux/slices/selectedDialog';

const rootReducer = combineReducers({
  currentUser,
  appIsLoading,
  dialogs,
  messages,
  users,
  selectedDialog,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const resetStore = () => {
  store.dispatch(resetAppIsLoading());
  store.dispatch(resetDialogs());
  store.dispatch(resetMessages());
  store.dispatch(resetUsers());
  store.dispatch(unselectDialog());
  store.dispatch(resetCurrentUser());
};

export default store;
