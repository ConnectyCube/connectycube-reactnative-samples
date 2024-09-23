import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectyCube from 'react-native-connectycube';
import { Provider } from 'react-redux'

import config from './connectycube_config.json';
ConnectyCube.init(...config.connectyCubeConfig);

import store from './src/store'
import LoginScreen from './src/components/screens/login-screen';
import VideoScreen from './src/components/screens/video-screen';
import InitiateCallScreen from './src/components/screens/initiate-call-screen';
import IncomingCallScreen from './src/components/screens/incoming-call-screen';

const Stack = createNativeStackNavigator();

export default function App () {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen 
            name="LoginScreen" 
            component={LoginScreen} 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="IncomingCallScreen" 
            component={IncomingCallScreen} 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="InitiateCallScreen" 
            component={InitiateCallScreen} 
            options={{
              headerStyle: {
                backgroundColor: 'grey',
              },
              headerTintColor: '#fff',
              headerShown: true,
              headerLeft: () => <></>,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="VideoScreen" 
            component={VideoScreen} 
            options={{
              headerShown: false
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};
