import React from 'react';
import { useSelector } from 'react-redux';
import MainStack from './MainStack';
import AuthStack from './AuthStack';

export default function AppStack() {
  const currentUser = useSelector((state) => state.currentUser);

  return currentUser ? <MainStack /> : <AuthStack />;
}
