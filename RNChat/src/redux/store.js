import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { currentUser, resetCurrentUser } from './slices/currentUser';
import { appIsLoading, resetAppIsLoading } from './slices/app';
import { dialogs, resetDialogs } from './slices/dialogs';
import { messages, resetMessages } from './slices/messages';
import { users, resetUsers } from './slices/users';
import { selectedDialog, unselectDialog } from './slices/selectedDialog';

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
