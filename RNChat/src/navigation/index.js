import React from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import Splash from '../screens/splash';
import AppStack from './AppStack';

export default function () {
  const appIsLoading = useSelector((state) => state.appIsLoading);

  return appIsLoading
    ? <Splash />
    : (
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    );
}
