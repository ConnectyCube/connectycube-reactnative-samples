import { Notifications } from 'react-native-notifications';
import ConnectyCube from 'react-native-connectycube'
import store from '../store'
import { Platform } from 'react-native'
import appConfig from '../../config.json'
import AsyncStorage from '@react-native-community/async-storage'
import Dialog from '../models/dialogs'
import User from '../models/user'
import { addNewDialog } from '../actions/dialogs'
import { fetchUsers } from '../actions/users'

class PushNotificationService {
  static DEVICE_SUBSCRIPTION_ID = 'DEVICE_SUBSCRIPTION_ID'
  static Navigation = null

  init(navigation) {
    PushNotificationService.Navigation = navigation

    Notifications.ios.checkPermissions().then((currentPermissions) => {
        console.log('Badges enabled: ' + !!currentPermissions.badge);
        console.log('Sounds enabled: ' + !!currentPermissions.sound);
        console.log('Alerts enabled: ' + !!currentPermissions.alert);
        console.log('Car Play enabled: ' + !!currentPermissions.carPlay);
        console.log('Critical Alerts enabled: ' + !!currentPermissions.criticalAlert);
        console.log('Provisional enabled: ' + !!currentPermissions.provisional);
        console.log('Provides App Notification Settings enabled: ' + !!currentPermissions.providesAppNotificationSettings);
        console.log('Announcement enabled: ' + !!currentPermissions.announcement);
    });

    Notifications.registerRemoteNotifications();

    Notifications.events().registerRemoteNotificationsRegistered((event) => {
      // TODO: Send the token to my server so it could send back push notifications...
      console.log("Device Token Received", event.deviceToken);

      this.subcribeToPushNotification(event.deviceToken)
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
      console.error("Failed to get Device Token", event);
    });

    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`);
      completion({alert: false, sound: false, badge: false});
    });

    Notifications.events().registerNotificationReceivedBackground((notification, completion) => {
      console.log("Notification Received - Background", notification.payload);

      // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
      completion({alert: true, sound: true, badge: false});
    });

    Notifications.events().registerNotificationOpened((notification, completion) => {
      console.log(`Notification opened: ${notification.payload}`);
      completion();
    });
  }

  async subcribeToPushNotification(token) {
    const DeviceInfo = require('react-native-device-info').default
    const params = {
      notification_channels: Platform.OS === 'ios' ? 'apns' : 'gcm',
      device: {
        platform: Platform.OS,
        udid: DeviceInfo.getUniqueId()
      },
      push_token: {
        environment: __DEV__ ? 'development' : 'production',
        client_identification_sequence: token.token
      }
    }

    ConnectyCube.pushnotifications.subscriptions.create(params)
      .then(result => {
        console.log('PushNotificationService - result', result)
        AsyncStorage.setItem(PushNotificationService.DEVICE_SUBSCRIPTION_ID, `${result[0].subscription.id}`)
      })
      .catch(error => {
        console.log('PushNotificationService - error', error)
      })
  }

  // async onNotification(notification) {
  //   console.log("NOTIFICATION:", notification)
  //   let dialogId = null
  //   if (Platform.OS === 'ios') {
  //     dialogId = notification.data.dialog_id
  //   } else {
  //     dialogId = notification.dialog_id
  //   }
  //   if (notification.userInteraction && dialogId !== PushNotificationService.getSelectedDialog()) {
  //     const dialog = await PushNotificationService.getDialogById(dialogId)
  //     PushNotificationService.Navigation.push('Chat', { dialog })
  //   }
  // }

  static async getDialogById(dialogId) {
    const getDialog = store.getState().dialogs.find(elem => elem.id === dialogId)
    if (getDialog) {
      return getDialog
    } else {
      const filters = {
        _id: {
          in: dialogId
        }
      }
      // get Dialog from server
      const dialogsFromServer = await ConnectyCube.chat.dialog.list(filters)
      const dialog = new Dialog(dialogsFromServer.items[0])

      // get User from server
      const currentUser = dialog.user_id
      const participantId = dialog.occupants_ids.find(elem => elem.id !== currentUser)
      const responseUser = await ConnectyCube.users.get(participantId)
      const user = new User(responseUser.user)
      store.dispatch(fetchUsers([user]))
      store.dispatch(addNewDialog(dialog))
      return dialog
    }
  }

  static getSelectedDialog() {
    return store.getState().selectedDialog
  }

}

// create instance
const pushNotificationService = new PushNotificationService()

Object.freeze(pushNotificationService)

export default pushNotificationService

