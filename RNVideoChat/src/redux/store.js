import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { activeCall, resetActiveCall } from './slices/activeCall';
import { currentUser, resetCurrentUser } from './slices/currentUser';

const rootReducer = combineReducers({
  activeCall,
  currentUser,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});

export const resetStore = () => {
  store.dispatch(resetActiveCall());
  store.dispatch(resetCurrentUser());
};

export default store;
