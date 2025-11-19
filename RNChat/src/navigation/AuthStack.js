import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from '../screens/auth';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
