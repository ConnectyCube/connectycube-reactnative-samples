import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import LoginScreen from './screens/login-screen';
import VideoScreen from './screens/video-screen';
import InitiateCallScreen from './screens/initiate-call-screen';
import IncomingCallScreen from './screens/incoming-call-screen';
import { useRef } from 'react';
import { CallService } from '../services';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const currentUser = useSelector(state => state.currentUser);
  const navigationRef = useRef();

  const saveNavigationRef = () => {
    CallService.navigation = navigationRef.current;
  };

  return (
    <NavigationContainer ref={navigationRef} onReady={saveNavigationRef}>
      {currentUser ? (
        <Stack.Navigator>
          <Stack.Screen
            name="InitiateCallScreen"
            component={InitiateCallScreen}
            options={{
              headerShown: true,
              headerLeft: () => null,
              headerStyle: {
                backgroundColor: 'black',
              },
              headerTitleAlign: 'center',
              headerTintColor: 'white',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen name="IncomingCallScreen" component={IncomingCallScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VideoScreen" component={VideoScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
