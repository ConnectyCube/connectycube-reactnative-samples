import { ConnectyCube } from '@connectycube/react';
import { PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import customEventEmitter, { CUSTOM_EVENTS } from '../events';
import { isAndroid, isIOS, platformOS, versionAndroid } from '../helpers/platform';
import DeviceInfo from 'react-native-device-info';

class PushNotificationService {
  static DEVICE_SUBSCRIPTION_ID = 'DEVICE_SUBSCRIPTION_ID';

  constructor() {
    if (PushNotificationService.instance) {
      return PushNotificationService.instance;
    }

    PushNotificationService.instance = this;
  }

  async init() {
    await this.handleOnNotificationPressed();
    await this.requestPermission();
    await this.registerRemoteMessages();
  }

  async registerRemoteMessages() {
    try {
      await messaging().registerDeviceForRemoteMessages();
      const deviceToken = await messaging().getToken();
      await this.subscribeToPushNotification(deviceToken);
      console.log('[PushNotification] registerDeviceForRemoteMessages Success:', deviceToken);
    } catch (error) {
      console.error('[PushNotification] registerDeviceForRemoteMessages Failed:', error);
    }
  }

  setRemoteNotificationHandler() {
    if (!isAndroid) return;

    messaging().setBackgroundMessageHandler(async ({ data }) => {
      const channelId = await notifee.createChannel({
        id: 'connectycube-chat-channel',
        name: 'connectycube-chat-notification',
        badge: true,
        vibration: true,
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
      });

      await notifee.displayNotification({
        data,
        title: data?.title || 'Notification',
        body: data?.message || 'Message',
        android: {
          channelId,
          pressAction: { id: 'default' },
        },
      });
    });
  }

  async getDialogIdFromInitialNotification() {
    const message = await messaging().getInitialNotification();

    return message?.data?.dialog_id ?? null;
  }

  async handleOnNotificationPressed() {
    if (isAndroid) {
      notifee.getInitialNotification().then(this.onAndroidNotificationPressed);
      notifee.onBackgroundEvent(this.onAndroidNotificationPressed);
    } else if (isIOS) {
      messaging().getInitialNotification().then(this.onNotificationPressed);
      messaging().onNotificationOpenedApp(this.onNotificationPressed);
    }
  }

  onNotificationPressed = (notification = {}) => {
    const dialogId = notification.data?.dialog_id ?? null;

    if (dialogId) {
      customEventEmitter.emit(CUSTOM_EVENTS.ON_NOTIFICATION_OPEN, dialogId);
    }
  };

  onAndroidNotificationPressed = async (payload = {}) => {
    const detail = payload.detail ?? payload;
    const { notification, pressAction } = detail;

    if (pressAction) {
      this.onNotificationPressed(notification);
    }
  };

  async subscribeToPushNotification(token) {
    const uniqueDeviceID = await DeviceInfo.getUniqueId();
    const params = {
      notification_channels: 'gcm',
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

  async requestPermission() {
    const authorizationStatus = await messaging().requestPermission();
    const iosGranted =
      authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

    let androidGranted = true;

    if (isAndroid && versionAndroid >= 33) {
      try {
        const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        androidGranted = result === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        androidGranted = false;
      }
    }

    return androidGranted && authorizationStatus === iosGranted;
  }
}

export default new PushNotificationService();

