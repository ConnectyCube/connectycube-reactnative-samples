import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider, useSelector} from 'react-redux';
import store from './src/redux/store';
import LoginScreen from './src/components/screens/login-screen';
import VideoScreen from './src/components/screens/video-screen';
import InitiateCallScreen from './src/components/screens/initiate-call-screen';
import IncomingCallScreen from './src/components/screens/incoming-call-screen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const currentUser = useSelector(state => state.currentUser);

  return currentUser ? (
    <Stack.Navigator>
      <Stack.Screen
        name="InitiateCallScreen"
        component={InitiateCallScreen}
        options={{
          headerShown: true,
          headerLeft: () => <></>,
          headerStyle: {
            backgroundColor: 'black',
          },
          headerTitleAlign: 'center',
          headerTintColor: 'white',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="IncomingCallScreen"
        component={IncomingCallScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="VideoScreen"
        component={VideoScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  ) : (
    <Stack.Navigator>
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
