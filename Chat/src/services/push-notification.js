import { Notifications } from 'react-native-notifications';
import ConnectyCube from 'react-native-connectycube'
import store from '../store'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import Dialog from '../models/dialogs'
import User from '../models/user'
import { addNewDialog } from '../actions/dialogs'
import { fetchUsers } from '../actions/users'

class PushNotificationService {
  static DEVICE_SUBSCRIPTION_ID = 'DEVICE_SUBSCRIPTION_ID'
  static Navigation = null

  constructor() {
    console.log("[PushNotificationService][constructor]");
    this._registerBackgroundTasks();
  }

  init(navigation) {
    PushNotificationService.Navigation = navigation

    if (Platform.OS === 'ios') {
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
    }

    Notifications.getInitialNotification().then((notification) => {
      console.log("Initial notification was:", (notification ? notification.payload : 'N/A'));

      // this.displayNotification({message: "hello"});
    })      
    .catch((err) => console.error("getInitialNotifiation() failed", err));

    Notifications.events().registerRemoteNotificationsRegistered((event) => {
      // TODO: Send the token to my server so it could send back push notifications...
      console.log("[PushNotificationService] Device Token Received", event.deviceToken);

      this.subcribeToPushNotification(event.deviceToken)
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
      console.error("[PushNotificationService] Failed to get Device Token", event);
    });

    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      console.log(`[PushNotificationService] Notification received in foreground`, notification.payload, notification?.payload?.message);

      if (Platform.OS === 'ios') {
        return;
      }

      PushNotificationService.displayNotification(notification.payload);

      completion({alert: false, sound: false, badge: false});
    });

    Notifications.events().registerNotificationReceivedBackground((notification, completion) => {
      console.log("[PushNotificationService] Notification Received - Background", notification.payload, notification?.payload?.message);

      PushNotificationService.displayNotification(notification.payload);

      // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
      completion({alert: true, sound: true, badge: false});
    });

    Notifications.events().registerNotificationOpened(async (notification, completion) => {
      console.log(`[PushNotificationService] Notification opened`, notification.payload);

      await this.onNotificationOpened(notification.payload)

      completion();
    });

    console.log(`[PushNotificationService]`);
    Notifications.registerRemoteNotifications();

  }

  _registerBackgroundTasks() {
    if (Platform.OS === 'ios') {
      return;
    }

    const { AppRegistry } = require("react-native");

    // https://reactnative.dev/docs/headless-js-android
    //
    AppRegistry.registerHeadlessTask(
      "JSNotifyWhenKilledTask",
      () => {
        return async (notificationBundle) => {
          console.log('[JSNotifyWhenKilledTask] notificationBundle', notificationBundle);

          PushNotificationService.displayNotification(notificationBundle);
        }
      },
    );
  }

  subcribeToPushNotification(token) {
    const DeviceInfo = require('react-native-device-info').default
    const params = {
      notification_channels: Platform.OS === 'ios' ? 'apns' : 'gcm',
      device: {
        platform: Platform.OS,
        udid: DeviceInfo.getUniqueId()
      },
      push_token: {
        environment: __DEV__ ? 'development' : 'production',
        client_identification_sequence: token
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

  static displayNotification(payload) {
    const extra = {dialog_id: 123, isLocal: true}

    const localNotification = Notifications.postLocalNotification({
      body: payload.message,
      title: "New message", // TODO: to use here chat name/sender name
      // sound: "chime.aiff",
      silent: false,
      category: "SOME_CATEGORY",
      userInfo: extra,
      extra,
    });
  }

  async onNotificationOpened(payload) {
    const dialogId = (Platform.OS === 'ios') ? payload.userInfo.dialog_id : payload.extra.dialog_id;
    if (dialogId !== store.getState().selectedDialog) {
      const dialog = await PushNotificationService.getDialogById(dialogId)
      PushNotificationService.Navigation.push('Chat', { dialog })
    }
  }

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

}

// create instance
const pushNotificationService = new PushNotificationService()

Object.freeze(pushNotificationService)

export default pushNotificationService

