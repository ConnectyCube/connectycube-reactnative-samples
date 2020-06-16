import React, { useContext } from 'react';
import PushNotification from 'react-native-push-notification';
import ConnectyCube from 'react-native-connectycube';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import appConfig from '../../config.json';
import Dialog from '../models/dialogs';
import User from '../models/user';
import { addNewDialog } from '../actions/dialogs';
import { fetchUsers } from '../actions/users';
import GlobalContext from '../store';
import UsersContext from './users-service';

const PushNotificationContext = React.createContext();

export default PushNotificationContext;

const PushNotificationProvider = ({ children }) => {
  const { store, dispatch } = useContext(GlobalContext);
  const UsersService = useContext(UsersContext);

  const init = (navigation) => {
    PushNotificationProvider.Navigation = navigation;
    const settings = {
      onRegister: subcribeToPushNotification,
      onNotification,
      popInitialNotification: true,
      requestPermissions: true,
    };
    if (Platform.OS !== 'ios') {
      settings.senderID = appConfig.senderID;
    } else {
      settings.permissions = {
        alert: true,
        badge: true,
        sound: true,
      };
    }
    PushNotification.configure(settings);
  };

  const subcribeToPushNotification = async (token) => {
    const DeviceInfo = require('react-native-device-info').default;
    const params = {
      notification_channels: Platform.OS === 'ios' ? 'apns' : 'gcm',
      device: {
        platform: Platform.OS,
        udid: DeviceInfo.getUniqueId(),
      },
      push_token: {
        environment: __DEV__ ? 'development' : 'production',
        client_identification_sequence: token.token,
      },
    };
    try {
      const result = await ConnectyCube.pushnotifications.subscriptions.create(params);
      console.log('PushNotificationService - result', result);
      AsyncStorage.setItem(PushNotificationProvider.DEVICE_TOKEN_KEY, `${result[0].subscription.id}`);
    } catch (error) {
      console.log('PushNotificationService - error', error);
    }
  };

  const onNotification = async (notification) => {
    console.log('NOTIFICATION:', notification);
    let dialogId = null;
    if (Platform.OS === 'ios') {
      dialogId = notification.data.dialog_id;
    } else {
      dialogId = notification.dialog_id;
    }
    if (notification.userInteraction && dialogId !== getSelectedDialog()) {
      const dialog = await getDialogById(dialogId);
      PushNotificationProvider.Navigation.push('Chat', { dialog, getUsersAvatar: UsersService.getUsersAvatar });
    }
  };

  const getDialogById = async (dialogId) => {
    const getDialog = store.dialogs.find(elem => elem.id === dialogId);
    if (getDialog) {
      return getDialog;
    }
    const filters = {
      _id: {
        in: dialogId,
      },
    };
    // get Dialog from server
    const dialogsFromServer = await ConnectyCube.chat.dialog.list(filters);
    const dialog = new Dialog(dialogsFromServer.items[0]);

    // get User from server
    const currentUser = dialog.user_id;
    const participantId = dialog.occupants_ids.find(elem => elem.id !== currentUser);
    const responseUser = await ConnectyCube.users.get(participantId);
    const user = new User(responseUser.user);
    dispatch(fetchUsers([user]));
    dispatch(addNewDialog(dialog));
    return dialog;
  };

  const getSelectedDialog = () => store.selectedDialog;

  return (
    <PushNotificationContext.Provider
      value={{
        init,
        subcribeToPushNotification,
        onNotification,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
};

PushNotificationProvider.DEVICE_TOKEN_KEY = 'DEVICE_TOKEN_KEY';

PushNotificationProvider.Navigation = null;

export { PushNotificationProvider };
