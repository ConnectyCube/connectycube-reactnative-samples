import { AppRegistry } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import { Notifications } from 'react-native-notifications';
import DeviceInfo from 'react-native-device-info';
import store from '../redux/store';
import { setCallSession } from '../redux/slices/activeCall';
import { isAndroid, isIOS, platformOS } from '../utils';
import notifee, { AndroidDefaults, AndroidImportance, AndroidLaunchActivityFlag, AndroidVisibility, EventType } from '@notifee/react-native';
// import CallKeepService from './call-keep-service';

class PushNotificationsService {
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
    console.log('[PushNotificationsService][registerEvents]');

    Notifications.events().registerRemoteNotificationsRegistered((event) => {
      console.warn('[PushNotificationsService] registerRemoteNotificationsRegistered:', event.deviceToken);
      this.subscribe(event.deviceToken, platformOS === 'android' ? 'gcm' : 'apns');
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed((error) => {
      console.error('[PushNotificationsService] registerRemoteNotificationsRegistrationFailed:', error);
    });
    Notifications.events().registerRemoteNotificationsRegistrationDenied(() => {
      console.error('[PushNotificationsService] registerRemoteNotificationsRegistrationDenied:');
    });
    Notifications.events().registerNotificationReceivedForeground(
      ({ payload }, completion) => {
        console.warn('[PushNotificationsService] registerNotificationReceivedForeground:', payload);
        completion({ alert: true, sound: true, badge: true });
      },
    );
    Notifications.events().registerNotificationReceivedBackground(
      async ({ payload }, completion) => {
        console.log('[PushNotificationsService] registerNotificationReceivedBackground:', payload);
        this.displayNotification(payload);
        // CallKeepService.displayIncomingCall(payload);
        // if (isAndroid) {
        //   const dummyCallSession = {
        //     initiatorID: payload.initiatorId,
        //     opponentsIDs: payload.opponentsIds.split(','),
        //     ID: payload.uuid,
        //   };
        //   store.dispatch(setCallSession({
        //     session: dummyCallSession,
        //     isIncoming: true,
        //     isDummySession: true,
        //   }));
        // }
        completion({ alert: true, sound: true, badge: false });
      },
    );
    Notifications.events().registerNotificationOpened(async (notification, completion) => {
      console.warn('[PushNotificationsService] registerNotificationOpened:', notification);
      completion();
    });

    if (isAndroid) {
      const initialNotification = await notifee.getInitialNotification();
      console.warn('NOTIFEE INITIAL >>>', JSON.stringify(initialNotification, null, 2));

      notifee.onBackgroundEvent(async ({ detail, type }) => {
        console.warn('NOTIFEE IN BACKGROUND >>>', JSON.stringify(detail, null, 2));
        const { pressAction, notification } = detail;
        const actionId = pressAction?.id;
        const data = notification.data;
        if (type === EventType.PRESS) {
          if (actionId === 'accept') {
            this.handlePressAcceptCall(data);
          } else if (actionId === 'reject') {
            this.handlePressRejectCall(data);
          } else {
            this.handlePressDefault(data);
          }
        }
      });
      notifee.onForegroundEvent(async (event) => {
        console.warn('NOTIFEE IN FOREGROUND >>>', JSON.stringify(event, null, 2));
      });
      notifee.registerForegroundService((notification) => {
        console.warn('registerForegroundService notification >>>', JSON.stringify(notification, null, 2));
        return new Promise(() => {
          notifee.onBackgroundEvent(async (event) => {
            console.warn('||| NOTIFEE IN BACKGROUND (SERVICE) >>>', JSON.stringify(event, null, 2));
          });
          notifee.onForegroundEvent(async (event) => {
            console.warn('||| NOTIFEE IN FOREGROUND (SERVICE) >>>', JSON.stringify(event, null, 2));
          });
        });
      });
      this.registerBackgroundTask();
    }

    if (isIOS) {
      Notifications.ios.events().registerPushKitRegistered(event => {
        console.log('[PushNotificationsService] registerPushKitRegistered:', event.pushKitToken);
        this.subscribe(event.pushKitToken, 'apns_voip');
      });
    }
  }

  handlePressAcceptCall(data) {
    console.log(data);
    console.log('|||||||||||||||||||||||||||||||||||');
    console.log('||||||||||| ACCEPT CALL |||||||||||');
    console.log('|||||||||||||||||||||||||||||||||||');
  }

  handlePressRejectCall() {
    console.log(data);
    console.log('|||||||||||||||||||||||||||||||||||');
    console.log('||||||||||| REJECT CALL |||||||||||');
    console.log('|||||||||||||||||||||||||||||||||||');
  }

  handlePressDefault() {
    console.log(data);
    console.log('||||||||||||||||||||||||||||||||||||');
    console.log('||||||||||| DEFAULT ACTION |||||||||');
    console.log('||||||||||||||||||||||||||||||||||||');
  }

  checkInitialNotification() {
    Notifications.getInitialNotification()
      .then((notification) => {
        console.log('[PushNotificationsService][getInitialNotification]', (notification ? notification.payload : 'N/A'));
      })
      .catch((err) => {
        console.error('getInitialNotification() failed', err);
      });
  }

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
            console.warn('[PushNotificationsService][deleteSubscription] Error1', error);
          });
        }
      }
    }).catch(error => {
      console.warn('[PushNotificationsService][deleteSubscription] Error2', error);
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
        console.warn('[PushNotificationsService][sendPushNotification] Error', error);
      });
  }

  registerBackgroundTask() {
    AppRegistry.registerHeadlessTask('CallNotificationHeadlessJsTask', () => async (notification) => {
      console.warn(
        '[processIncomingCallNotification]',
        notification
      );

      await this.displayNotification(notification);
    });
  }

  async startForegroundService(data) {
    const channelId = await notifee.createChannel({
      id: 'foreground-service-channel',
      name: 'foreground-service-notification',
    });
    const notificationId = await notifee.displayNotification({
      data,
      title: data.message,
      body: `Incoming ${data.callType} call`,
      android: {
        channelId,
        asForegroundService: true,
      },
    });
    return notificationId;
  }

  async displayNotification(data) {
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
          { title: 'Accept', pressAction: { id: 'accept' } },
          { title: 'Reject', pressAction: { id: 'reject' } },
        ],
      },
    });

    return notificationId;
  }
}

export default new PushNotificationsService();
