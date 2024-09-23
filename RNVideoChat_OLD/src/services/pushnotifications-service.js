import ConnectyCube from 'react-native-connectycube';
import { Notifications } from 'react-native-notifications';
import { getUniqueId } from 'react-native-device-info';
import invokeApp from 'react-native-invoke-app';

import PermissionsService from './permissions-service';
import { setCallSession } from '../actions/activeCall';
import store from '../store';

class PushNotificationsService {
  constructor() {
    console.log("[PushNotificationsService][constructor]");
    this._registerBackgroundTasks();
  }

  init() {
    console.log("[PushNotificationsService][init]");
    
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
  
      this.subscribeToPushNotifications(event.deviceToken)
    });
    Notifications.events().registerRemoteNotificationsRegistrationFailed((event) => {
      console.error("[PushNotificationService] Failed to get Device Token", event);
    });

    // VoIP
    if (Platform.OS === 'ios') {
      Notifications.ios.events().registerPushKitRegistered(event => {
        console.log("[PushNotificationService] Push Kit received", event.pushKitToken);
        this.subscribeToVOIPPushNotifications(event.pushKitToken);
      });
      // This is handled via iOS native code AppDelegate.m file
      //
      // Notifications.ios.events().registerPushKitNotificationReceived((payload, complete) => {
      //   complete();
      // });
    }
  
    Notifications.events().registerNotificationReceivedForeground((notification, completion) => {
      console.log(`[PushNotificationService] Notification received in foreground`, notification.payload, notification?.payload?.message);
  
      // if (Platform.OS === 'android') {
      //   PushNotificationsService.displayNotification(notification.payload);
      // }
  
      completion({alert: false, sound: false, badge: false});
    });
  
    Notifications.events().registerNotificationReceivedBackground(async (notification, completion) => {
      console.log("[PushNotificationService] Notification Received - Background", notification.payload, notification?.payload?.message);
  
      if (Platform.OS === 'android') {
        if (await PermissionsService.isDrawOverlaysPermisisonGranted()) {
          invokeApp();

          const dummyCallSession = {
            initiatorID: notificationBundle.initiatorId,
            opponentsIDs: notificationBundle.opponentsIds.split(","),
            ID: notificationBundle.uuid
          }
          store.dispatch(setCallSession(dummyCallSession, true, true));
        } else {
          PushNotificationsService.displayNotification(notification.payload);
        }
      }
  
      // Calling completion on iOS with `alert: true` will present the native iOS inApp notification.
      completion({alert: true, sound: true, badge: false});
    });
  
    Notifications.events().registerNotificationOpened(async (notification, completion) => {
      console.log(`[PushNotificationService] Notification opened`, notification.payload);
  
      await this.onNotificationOpened(notification.payload)
  
      completion();
    });
  
    Notifications.registerRemoteNotifications();

    if (Platform.OS === 'ios') {
      console.log("registerPushKit")
      Notifications.ios.registerPushKit();
    }
  }

  static displayNotification(payload) {
    const extra = {dialog_id: payload.dialog_id, isLocal: true}
  
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

          if (await PermissionsService.isDrawOverlaysPermisisonGranted()) {
            invokeApp();

            const dummyCallSession = {
              initiatorID: notificationBundle.initiatorId,
              opponentsIDs: notificationBundle.opponentsIds.split(","),
              ID: notificationBundle.uuid
            }
            store.dispatch(setCallSession(dummyCallSession, true, true));
          } else {
            PushNotificationsService.displayNotification(notificationBundle);
          }
        }
      },
    );
  }

  subscribeToPushNotifications(deviceToken) {
     const params = {
       notification_channel: Platform.OS === 'ios' ? 'apns' : 'gcm',
       device: {
         platform: Platform.OS,
         udid: getUniqueId()
       },
       push_token: {
         environment: __DEV__ ? 'development' : 'production',
         client_identification_sequence: deviceToken
       }
     }

     ConnectyCube.pushnotifications.subscriptions.create(params)
       .then(result => {
         console.log("[PushNotificationsService][subscribeToPushNotifications] Ok");
       }).catch(error => {
         console.warn("[PushNotificationsService][subscribeToPushNotifications] Error", error);
       });
  }

  subscribeToVOIPPushNotifications(deviceToken) {
     const params = {
       notification_channel: 'apns_voip',
       device: {
         platform: Platform.OS,
         udid: getUniqueId()
       },
       push_token: {
         environment: __DEV__ ? 'development' : 'production',
         client_identification_sequence: deviceToken
       }
     }

     ConnectyCube.pushnotifications.subscriptions.create(params)
       .then(result => {
         console.log("[PushNotificationsService][subscribeToVOIPPushNotifications] Ok");
       }).catch(error => {
         console.warn("[PushNotificationsService][subscribeToVOIPPushNotifications] Error", error);
       });
  }

  deleteSubscription() {
    const deviceUdid = getUniqueId();
    ConnectyCube.pushnotifications.subscriptions.list().then(result => {
      for (let item of result) {
        const subscription = item.subscription;
        if (subscription.device.platform === Platform.OS && subscription.device.udid === deviceUdid) {
          ConnectyCube.pushnotifications.subscriptions.delete(subscription.id).then(result => {
            console.log("[PushNotificationsService][deleteSubscription] Ok", subscription.id);
          }).catch(error => {
            console.warn("[PushNotificationsService][deleteSubscription] Error1", error);
          });
        }
      }
    }).catch(error => {
      console.warn("[PushNotificationsService][deleteSubscription] Error2", error);
    });
  };

  sendPushNotification(recipientsUsersIds, params) {
    const payload = JSON.stringify(params);
    const pushParameters = {
      notification_type: "push",
      user: { ids: recipientsUsersIds },
      environment: __DEV__ ? "development" : "production",
      message: ConnectyCube.pushnotifications.base64Encode(payload),
    };

    ConnectyCube.pushnotifications.events.create(pushParameters)
      .then(result => {
        console.log("[PushNotificationsService][sendPushNotification] Ok");
      }).catch(error => {
        console.warn("[PushNotificationsService][sendPushNotification] Error", error);
      });
  }
}

const pushNotificationsService = new PushNotificationsService();
export default pushNotificationsService;