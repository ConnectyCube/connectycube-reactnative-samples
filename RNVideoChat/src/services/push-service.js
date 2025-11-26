import { ConnectyCube } from '@connectycube/react';
import messaging from '@react-native-firebase/messaging';
import VoipPushNotification from 'react-native-voip-push-notification';
import notifee, { AndroidCategory, AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import DeviceInfo from 'react-native-device-info';
import { isAndroid, isIOS, platformOS } from '../utils';
import { CallService, AuthService } from '.';
import store from '../redux/store';
import { showIncomingCallScreen } from '../redux/slices/activeCall';

class PushService {
  lastUUID;
  lastRemoteMessageId;

  constructor() {
    console.log('[PushService][constructor]');
    if (PushService.instance) {
      return PushService.instance;
    }

    PushService.instance = this;
  }

  init() {
    if (isAndroid) {
      messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        console.log('Background Remote Message:', JSON.stringify(remoteMessage, null, 2));

        if (!CallService.currentUser) {
          CallService.createDummyCallSession(remoteMessage.data);
          await AuthService.autoLogin();
        }

        await this.createAndShowNotification(remoteMessage, 'default');
      });

      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground Remote Message', JSON.stringify(remoteMessage, null, 2));
        await this.createAndShowNotification(remoteMessage, 'default');
      });

      notifee.onBackgroundEvent(async ({ detail, type }) => {
        const { notification, pressAction } = detail;
        this.handleNotifeeEvent(notification.data, pressAction?.id);
      });
      notifee.onForegroundEvent(async ({ detail, type }) => {
        const { notification, pressAction } = detail;
        this.handleNotifeeEvent(notification.data, pressAction?.id);
      });
    }

    if (isIOS) {
      VoipPushNotification.addEventListener('register', (token) => {
        console.log('[VoipPushNotification][register]', token);
        this.subscribe(token, 'apns_voip');
      });
      VoipPushNotification.addEventListener('notification', (data) => {
        console.log('[VoipPushNotification][notification]', data);
      });
    }
  }

  async register() {
    await notifee.requestPermission();

    if (isIOS) {
      VoipPushNotification.registerVoipToken();
    } else {
      try {
        await messaging().registerDeviceForRemoteMessages();
        const deviceToken = await messaging().getToken();
        await this.subscribe(deviceToken, 'gcm');
        console.log('[PushNotification] registerDeviceForRemoteMessages Success:', deviceToken);
      } catch (error) {
        console.error('[PushNotification] registerDeviceForRemoteMessages Failed:', error);
      }
    }
  }

  handleNotifeeEvent = async (payload, action = 'unknown') => {
    this.cancelNotification();

    switch (action) {
      case 'accept':
        console.log('[PushService] handleNotifeeEvent ACCEPT from background');
        CallService.acceptCall();
        notifee.cancelAllNotifications();
        break;
      case 'reject':
        console.log('[PushService] handleNotifeeEvent REJECT from background');
        CallService.rejectCall();
        notifee.cancelAllNotifications();
        break;
      case 'default':
        console.log('[PushService] handleNotifeeEvent SHOW from background');
        store.dispatch(showIncomingCallScreen());
        notifee.cancelAllNotifications();
        break;
      default:
        break;
    }
  };

  async subscribe(token, type) {
    const uniqueId = await DeviceInfo.getUniqueId();
    const bundleId = DeviceInfo.getBundleId();
    const params = {
      notification_channel: type,
      device: {
        platform: platformOS,
        udid: uniqueId,
      },
      push_token: {
        environment: __DEV__ ? 'development' : 'production',
        client_identification_sequence: token,
        bundle_identifier: bundleId,
      },
    };

    ConnectyCube.pushnotifications.subscriptions.create(params)
      .then(result => {
        console.log('[PushService] subscribe:', JSON.stringify(result, null, 2));
      }).catch(error => {
        console.error('[PushService] subscribe:', JSON.stringify(error, null, 2));
      });
  }

  async deleteSubscriptions() {
    const uniqueId = await DeviceInfo.getUniqueId();
    const resultsList = await ConnectyCube.pushnotifications.subscriptions.list();
    const filteredList = resultsList.filter(({ subscription }) => subscription.device.udid === uniqueId);
    const promises = filteredList.map(({ subscription }) => ConnectyCube.pushnotifications.subscriptions.delete(subscription.id));

    await Promise.all(promises);
  }

  sendPushNotification(recipientsUsersIds, params) {
    const payload = JSON.stringify(params);
    const pushParameters = {
      notification_type: 'push',
      user: { ids: recipientsUsersIds },
      environment: __DEV__ ? 'development' : 'production',
      message: ConnectyCube.pushnotifications.base64Encode(payload),
    };

    ConnectyCube.pushnotifications.events.create(pushParameters)
      .then(result => {
        console.log('[PushService][sendPushNotification] Ok', result);
      }).catch(error => {
        console.log('[PushService][sendPushNotification] Error', error);
      });
  }

  async createAndShowNotification(remoteMessage, launchActivity = undefined) {
    const data = remoteMessage.data;

    if (data.uuid === this.lastUUID || remoteMessage.messageId === this.lastRemoteMessageId) {
      return;
    }

    this.lastRemoteMessageId = remoteMessage.remoteMessageId;
    this.lastUUID = data.uuid;

    const channelId = await notifee.createChannel({
      id: 'incoming-call-channel',
      name: 'incoming-call-notification',
      badge: false,
      vibration: true,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });
    const notificationParams = {
      data,
      title: data.message,
      body: `Incoming ${data?.callType} call`,
      android: {
        channelId,
        category: AndroidCategory.CALL,
        importance: AndroidImportance.HIGH,
        ongoing: true,
        loopSound: true,
        fullScreenAction: {
          id: 'open', // action to open activity
        },
        pressAction: { id: 'default' },
        actions: [
          { title: 'Accept', pressAction: { id: 'accept', launchActivity } },
          { title: 'Reject', pressAction: { id: 'reject' } },
        ],
      },
    };

    await notifee.displayNotification(notificationParams);
  }

  cancelNotification() {
    if (this.notifeeNotificationId) {
      notifee.cancelNotification(this.notifeeNotificationId);
      this.notifeeNotificationId = null;
    }
  }
}

export default new PushService();
