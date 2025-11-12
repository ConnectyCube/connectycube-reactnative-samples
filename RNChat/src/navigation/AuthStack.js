import React from 'react';
import { createNativeStackNavigator } from '../../node_modules/@react-navigation/native-stack/lib/typescript/src';
import Auth from '../screens/auth';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
