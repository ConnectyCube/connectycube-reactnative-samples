import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthScreen from './components/AuthScreen';
import VideoScreen from './components/VideoScreen';
import RTCViewFullScreenModal from './components/VideoScreen/RTCViewFullScreenModal';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="AuthScreen" component={AuthScreen} />
        <Stack.Screen name="VideoScreen" component={VideoScreen} />
        <Stack.Screen
          name="FullScreenModal"
          component={RTCViewFullScreenModal}
          screenOptions={{
            presentation: 'fullScreenModal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
