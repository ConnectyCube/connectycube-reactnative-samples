import React from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '../../node_modules/@react-navigation/native/lib/typescript/src';
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
