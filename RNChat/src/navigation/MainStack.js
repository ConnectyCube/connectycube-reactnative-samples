import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dialogs from '../screens/main/dialogs';
import Settings from '../screens/main/settings/index';
import Chat from '../screens/main/chat/index';
import ImageViewer from '../screens/main/chat/imageViewer';
import Contacts from '../screens/main/contacts/index';
import CreateDialog from '../screens/main/contacts/createDialog';
import GroupDetails from '../screens/main/chat/groupDetails';
import ContactDetails from '../screens/main/chat/contactDetails';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  const commonHeaderOptions = {
    headerTitleAlign: 'center',
    headerTitleStyle: {
      fontSize: 18,
      color: 'black',
    },
    headerBackTitle: 'Back',
  };

  return (
    <Stack.Navigator>
      <Stack.Screen name="Dialogs" component={Dialogs} options={{ ...commonHeaderOptions }} />
      <Stack.Screen name="Chat" component={Chat} options={{ ...commonHeaderOptions }} />
      <Stack.Screen
        name="ImageViewer"
        component={ImageViewer}
        options={{
          ...commonHeaderOptions,
          headerTitle: '',
          animation: 'fade',
        }}
      />
      <Stack.Screen name="Settings" component={Settings}
        options={{
          ...commonHeaderOptions,
          headerTitle: 'Settings',
        }}
      />
      <Stack.Screen name="Contacts" component={Contacts}
        options={{
          ...commonHeaderOptions,
          headerTitle: 'Users',
        }}
      />
      <Stack.Screen name="CreateDialog" component={CreateDialog}
        options={{
          ...commonHeaderOptions,
          headerTitle: 'New chat',
        }}
      />
      <Stack.Screen name="GroupDetails" component={GroupDetails}
        options={{
          ...commonHeaderOptions,
          headerTitle: 'Chat details',
        }}
      />
      <Stack.Screen name="ContactDetails" component={ContactDetails}
        options={{
          ...commonHeaderOptions,
          headerTitle: 'User profile',
        }}
      />
    </Stack.Navigator>
  );
}
