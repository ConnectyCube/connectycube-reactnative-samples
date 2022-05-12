/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import { Provider, useSelector } from 'react-redux'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native'

import store from './src/store'
import Splash from './src/screens/splash'
import Auth from './src/screens/auth'
import Dialogs from './src/screens/main/dialogs'
import Settings from './src/screens/main/settings/index'
import Chat from './src/screens/main/chat/index'
import Contacts from './src/screens/main/contacts/index'
import CreateDialog from './src/screens/main/contacts/createDialog'
import GroupDetails from './src/screens/main/chat/groupDetails'
import ContactDetails from './src/screens/main/chat/contactDetails'

const Stack = createNativeStackNavigator();

export default function App () {
  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
};

function Navigation() {
  const currentUser = useSelector((state) => state.currentUser);
  const appIsLoading = useSelector((state) => state.appIsLoading);

  return (
    <NavigationContainer>
      {appIsLoading ? 
        <Stack.Navigator>
          <Stack.Screen 
            name="Splash" 
            component={Splash} 
            options={{
              headerShown: false
            }}
            />
        </Stack.Navigator>
        : currentUser ? 
          (<Stack.Navigator>
            <Stack.Screen 
              name="Dialogs" 
              component={Dialogs} 
            />
            <Stack.Screen 
              name="Settings" 
              component={Settings} 
              options={{
                headerTitle: () => (
                  <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
                    Settings
                  </Text>
                ),
              }}
            />
            <Stack.Screen 
              name="Chat" 
              component={Chat} 
            />
            <Stack.Screen 
              name="Contacts" 
              component={Contacts} 
              options={{
                headerTitle: () => (
                  <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
                    Users
                  </Text>
                ),
              }}
            />
            <Stack.Screen 
              name="CreateDialog" 
              component={CreateDialog} 
              options={{
                headerTitle: () => (
                  <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
                    New chat
                  </Text>
                ),
              }}
            />
            <Stack.Screen 
              name="GroupDetails" 
              component={GroupDetails} 
              options={{
                headerTitle: () => (
                  <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
                    Chat details
                  </Text>
                ),
              }}
            />
            <Stack.Screen 
              name="ContactDetails" 
              component={ContactDetails} 
              options={{
                headerTitle: () => (
                  <Text numberOfLines={1} style={{ fontSize: 22, color: 'black' }}>
                    User profile
                  </Text>
                ),
              }}
            />
          </Stack.Navigator>)
          :
          (<Stack.Navigator>
            <Stack.Screen 
              name="Auth" 
              component={Auth} 
              options={{
                headerShown: false
              }}
            />
          </Stack.Navigator>)
      }
    </NavigationContainer>
  )
}