import ConnectyCube from 'react-native-connectycube';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import VoipPushNotification from 'react-native-voip-push-notification';
import { getUniqueId } from 'react-native-device-info';

import config from '../config';

export default class PushNotificationsService {
  init() {
    console.log("[PushNotificationsService][init]");

    // Must be outside of any component LifeCycle (such as `componentDidMount`).
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: data => {
        console.log("[PushNotificationsService][onRegister] TOKEN:", data);

        this.subscribeToPushNotifications(data.token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: notification => {
        console.log("[PushNotificationsService][onNotification] NOTIFICATION:", notification);

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: notification => {
        console.log("[PushNotificationsService][onAction] ACTION:", notification.action);
        console.log("[PushNotificationsService][onAction] NOTIFICATION:", notification);

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function(err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  }

  initVoIP() {
    console.log("[PushNotificationsService][initVoIP]");

    // ===== Step 1: subscribe `register` event =====
    // --- this.onVoipPushNotificationRegistered
    VoipPushNotification.addEventListener('register', (token) => {
      console.log("[PushNotificationsService][initVoIP][register]", token);

      // --- send token to your apn provider server
      this.subscribeToVOIPPushNotifications(token);
    });

    // ===== Step 2: subscribe `notification` event =====
    // --- this.onVoipPushNotificationiReceived
    VoipPushNotification.addEventListener('notification', (notification) => {
      console.log("[PushNotificationsService][initVoIP][notification]", notification);

      // --- when receive remote voip push, register your VoIP client, show local notification ... etc
      // this.doSomething();

      // --- optionally, if you `addCompletionHandler` from the native side, once you have done the js jobs to initiate a call, call `completion()`
      VoipPushNotification.onVoipNotificationCompleted(notification.uuid);
    });

    // ===== Step 3: subscribe `didLoadWithEvents` event =====
    VoipPushNotification.addEventListener('didLoadWithEvents', (events) => {
      console.log("[PushNotificationsService][initVoIP][didLoadWithEvents]", events);

      // --- this will fire when there are events occured before js bridge initialized
      // --- use this event to execute your event handler manually by event type
      if (!events || !Array.isArray(events) || events.length < 1) {
        return;
      }
      for (let voipPushEvent of events) {
        let { name, data } = voipPushEvent;
        if (name === VoipPushNotification.RNVoipPushRemoteNotificationsRegisteredEvent) {
          this.onVoipPushNotificationRegistered(data);
        } else if (name === VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent) {
          this.onVoipPushNotificationiReceived(data);
        }
      }
    });

    // ===== Step 4: register =====
    // --- it will be no-op if you have subscribed before (like in native side)
    // --- but will fire `register` event if we have latest cahced voip token ( it may be empty if no token at all )
    VoipPushNotification.registerVoipToken(); // --- register token
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
