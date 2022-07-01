import React, { useEffect} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ConnectyCube from 'react-native-connectycube';

import config from './connectycube_config.json';

import AuthScreen from './src/components/AuthScreen/index';
import VideoScreen from './src/components/VideoScreen/index';

const Stack = createNativeStackNavigator();

export default function App () {

  useEffect(() => {
    ConnectyCube.init(...config.connectyCubeConfig);
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="AuthScreen" 
          component={AuthScreen} 
          options={{
            headerShown: false
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
  );
};
