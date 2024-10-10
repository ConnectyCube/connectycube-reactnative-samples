import ConnectyCube from 'react-native-connectycube';
import { PermissionsAndroid } from 'react-native';
import { Notifications } from 'react-native-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customEventEmitter, { CUSTOM_EVENTS } from '../events';
import { isAndroid, isIOS, platformOS, versionAndroid } from '../helpers/platform';
import DeviceInfo from 'react-native-device-info';

class PushNotificationService {
  static DEVICE_SUBSCRIPTION_ID = 'DEVICE_SUBSCRIPTION_ID';

  isEvents = false;

  constructor() {
    if (PushNotificationService.instance) {
      return PushNotificationService.instance;
    }

    PushNotificationService.instance = this;
  }

  init() {
    this.getPostNotificationsPermissionAndroid();
    Notifications.registerRemoteNotifications();
    this.onInitialNotification();
  }

  registerEvents() {
    if (this.isEvents) {
      return;
    }

    Notifications.events().registerRemoteNotificationsRegistered(async ({ deviceToken }) => {
      console.log('[PushNotification] registerRemoteNotificationsRegistered:', deviceToken);
      await this.subscribeToPushNotification(deviceToken);
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed((error) => {
      console.error('[PushNotification] registerRemoteNotificationsRegistrationFailed:', error);
    });
    Notifications.events().registerRemoteNotificationsRegistrationDenied(() => {
      console.error('[PushNotification] registerRemoteNotificationsRegistrationDenied:');
    });
    Notifications.events().registerNotificationReceivedForeground(
      (notification, completion) => {
        console.log('[PushNotification] registerNotificationReceivedForeground:', notification);
        completion({ alert: true, sound: true, badge: true });
      },
    );
    Notifications.events().registerNotificationReceivedBackground(
      (notification, completion) => {
        console.log('[PushNotification] registerNotificationReceivedBackground:', notification);
        completion({ alert: true, sound: true, badge: false });
      },
    );
    Notifications.events().registerNotificationOpened(async (notification, completion) => {
      console.log('[PushNotification] onNotificationOpened:', notification);
      this.onNotificationOpened(notification.payload);
      completion();
    });

    this.isEvents = true;
  }

  onInitialNotification() {
    Notifications.getInitialNotification()
      .then((notification) => {
        console.log('[PushNotification] getInitialNotification:', (notification ? notification.payload : 'N/A'));
        if (notification) {
          this.onNotificationOpened(notification.payload);
        }
      })
      .catch((error) => {
        console.error('[PushNotification] getInitialNotification:', error);
      });
  }

  onNotificationOpened(payload) {
    customEventEmitter.emit(CUSTOM_EVENTS.ON_NOTIFICATION_OPEN, payload.dialog_id);
  }

  async subscribeToPushNotification(token) {
    const uniqueDeviceID = await DeviceInfo.getUniqueId();
    const params = {
      notification_channels: isIOS ? 'apns' : 'gcm',
      device: {
        platform: platformOS,
        udid: uniqueDeviceID,
      },
      push_token: {
        environment: __DEV__ ? 'development' : 'production',
        client_identification_sequence: token,
      },
    };

    ConnectyCube.pushnotifications.subscriptions.create(params)
      .then(result => {
        console.log('[PushNotification][ConnectyCube] subscriptions', { result });
        AsyncStorage.setItem(PushNotificationService.DEVICE_SUBSCRIPTION_ID, `${result[0].subscription.id}`);
      })
      .catch(error => {
        console.error('[PushNotification][ConnectyCube] subscriptions', { error });
      });
  }

  async getPostNotificationsPermissionAndroid() {
    let granted = true;

    if (isAndroid && versionAndroid >= 33) {
      try {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        granted = result === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        granted = false;
      }
    }

    return granted;
  }
}

export default new PushNotificationService();

