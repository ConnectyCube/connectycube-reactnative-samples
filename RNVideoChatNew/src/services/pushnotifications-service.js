import ConnectyCube from 'react-native-connectycube';
import { Notifications } from 'react-native-notifications';
import VoipPushNotification from 'react-native-voip-push-notification';
import { getUniqueId } from 'react-native-device-info';
import invokeApp from 'react-native-invoke-app';

import PermissionsService from './permissions-service';

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

  initVoIP() {
  //   console.log("[PushNotificationsService][initVoIP]");

  //   // ===== Step 1: subscribe `register` event =====
  //   // --- this.onVoipPushNotificationRegistered
  //   VoipPushNotification.addEventListener('register', (token) => {
  //     console.log("[PushNotificationsService][initVoIP][register]", token);

  //     // --- send token to your apn provider server
  //     this.subscribeToVOIPPushNotifications(token);
  //   });

  //   // ===== Step 2: subscribe `notification` event =====
  //   // --- this.onVoipPushNotificationiReceived
  //   VoipPushNotification.addEventListener('notification', (notification) => {
  //     console.log("[PushNotificationsService][initVoIP][notification]", notification);

  //     // --- when receive remote voip push, register your VoIP client, show local notification ... etc
  //     // this.doSomething();

  //     // --- optionally, if you `addCompletionHandler` from the native side, once you have done the js jobs to initiate a call, call `completion()`
  //     VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
  //   });

  //   // ===== Step 3: subscribe `didLoadWithEvents` event =====
  //   VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
  //     console.log("[PushNotificationsService][initVoIP][didLoadWithEvents]", events);

  //     // --- this will fire when there are events occured before js bridge initialized
  //     // --- use this event to execute your event handler manually by event type
  //     if (!events || !Array.isArray(events) || events.length < 1) {
  //       return;
  //     }
  //     for (let voipPushEvent of events) {
  //       let { name, data } = voipPushEvent;
  //       if (name === VoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent) {
  //         this.onVoipPushNotificationRegistered(data);
  //       } else if (name === VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent) {
  //         this.onVoipPushNotificationiReceived(data);
  //       }
  //     }
  //   });

  //   // ===== Step 4: register =====
  //   // --- it will be no-op if you have subscribed before (like in native side)
  //   // --- but will fire `register` event if we have latest cahced voip token ( it may be empty if no token at all )
  //   VoipPushNotification.registerVoipToken(); // --- register token
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

  deleteSubscription(deviceUdid) {
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