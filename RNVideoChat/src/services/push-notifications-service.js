import { AppRegistry } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import { Notifications } from 'react-native-notifications';
import DeviceInfo from 'react-native-device-info';
import store from '../redux/store';
import { setDummyCallSession } from '../redux/slices/activeCall';
import { isAndroid, isIOS, platformOS } from '../utils';
import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { CallService, AuthService } from '.';

class PushNotificationsService {
  isEvents = false;

  constructor() {
    console.log('[PushNotificationsService][constructor]');
    if (PushNotificationsService.instance) {
      return PushNotificationsService.instance;
    }

    PushNotificationsService.instance = this;
  }

  async register() {
    console.log('[PushNotificationsService][register]');
    Notifications.registerRemoteNotifications();

    if (isAndroid) {
      await notifee.requestPermission();
    }
    if (isIOS) {
      Notifications.ios.registerPushKit();
    }
  }

  async registerEvents() {
    if (this.isEvents) {
      return;
    }

    Notifications.events().registerRemoteNotificationsRegistered((event) => {
      console.log('[PushNotificationsService] registerRemoteNotificationsRegistered:', event.deviceToken);
      this.subscribe(event.deviceToken, platformOS === 'android' ? 'gcm' : 'apns');
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed((error) => {
      console.error('[PushNotificationsService] registerRemoteNotificationsRegistrationFailed:', error);
    });
    Notifications.events().registerRemoteNotificationsRegistrationDenied(() => {
      console.error('[PushNotificationsService] registerRemoteNotificationsRegistrationDenied:');
    });
    Notifications.events().registerNotificationReceivedBackground(
      async ({ payload }, completion) => {
        console.log('[PushNotificationsService] registerNotificationReceivedBackground:', payload);
        this.createAndShowNotification(payload, 'default');
        completion({ alert: true, sound: true, badge: false });
      },
    );

    if (isAndroid) {
      notifee.onBackgroundEvent(async ({ detail, type }) => {
        const { notification, pressAction } = detail;
        this.handleNotifeeEvent(notification.data, pressAction?.id);
      });
      notifee.onForegroundEvent(async ({ detail, type }) => {
        const { notification, pressAction } = detail;
        this.handleNotifeeEvent(notification.data, pressAction?.id);
      });

      AppRegistry.registerHeadlessTask('CallNotificationHeadlessJsTask', () =>
        async (payload) => {
          await AuthService.autoLogin();
          this.createDummyCallSession(payload);
          this.createAndShowNotification(payload, 'default');
        });
    }

    if (isIOS) {
      Notifications.ios.events().registerPushKitRegistered(event => {
        console.log('[PushNotificationsService] registerPushKitRegistered:', event.pushKitToken);
        this.subscribe(event.pushKitToken, 'apns_voip');
      });
    }

    this.isEvents = true;
  }

  handleNotifeeEvent = async (payload, action = 'unknown') => {
    switch (action) {
      case 'accept':
        console.log('[PushNotificationsService] handleNotifeeEvent ACCEPT from background');
        CallService.acceptCall();
        break;
      case 'reject':
        console.log('[PushNotificationsService] handleNotifeeEvent REJECT from background');
        CallService.rejectCall();
        break;
      case 'default':
        console.log('[PushNotificationsService] handleNotifeeEvent SHOW from background');
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
        console.log('[PushNotificationsService] subscribe:', JSON.stringify(result, null, 2));
      }).catch(error => {
        console.error('[PushNotificationsService] subscribe:', JSON.stringify(error, null, 2));
      });
  }

  async deleteSubscription() {
    const uniqueId = await DeviceInfo.getUniqueId();

    ConnectyCube.pushnotifications.subscriptions.list().then(result => {
      for (let item of result) {
        const subscription = item.subscription;
        if (subscription.device.platform === platformOS && subscription.device.udid === uniqueId) {
          ConnectyCube.pushnotifications.subscriptions.delete(subscription.id).then(result => {
            console.log('[PushNotificationsService][deleteSubscription] Ok', subscription.id);
          }).catch(error => {
            console.log('[PushNotificationsService][deleteSubscription] Error1', error);
          });
        }
      }
    }).catch(error => {
      console.log('[PushNotificationsService][deleteSubscription] Error2', error);
    });
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
        console.log('[PushNotificationsService][sendPushNotification] Ok', result);
      }).catch(error => {
        console.log('[PushNotificationsService][sendPushNotification] Error', error);
      });
  }

  createDummyCallSession(payload) {
    if (isAndroid) {
      const ID = payload.uuid;
      const initiatorID = Number(payload.initiatorId);
      const opponentsIDs = payload.opponentsIds.split(',').map(Number);
      const callType = payload.callType === 'video'
        ? ConnectyCube.videochat.CallType.VIDEO
        : ConnectyCube.videochat.CallType.AUDIO;
      const session = { initiatorID, opponentsIDs, callType, ID };

      store.dispatch(setDummyCallSession(session));
    }
  }

  async createAndShowNotification(data, launchActivity = undefined) {
    const channelId = await notifee.createChannel({
      id: 'incoming-call-channel',
      name: 'incoming-call-notification',
      badge: false,
      vibration: true,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });

    const notificationId = await notifee.displayNotification({
      data,
      title: data.message,
      body: `Incoming ${data.callType} call`,
      android: {
        channelId,
        ongoing: true,
        loopSound: true,
        pressAction: { id: 'default' },
        actions: [
          { title: 'Accept', pressAction: { id: 'accept', launchActivity } },
          { title: 'Reject', pressAction: { id: 'reject' } },
        ],
      },
    });

    return notificationId;
  }
}

export default new PushNotificationsService();
