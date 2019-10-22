import {Platform} from 'react-native';
import ConnectyCube from 'connectycube-reactnative';
// TODO: to disable fo iOS
// import PushNotification from 'react-native-push-notification'
import appConfig from '../../app.json';

// TODO: use import from 'react-native-push-notification' for both OS
if (Platform.OS === 'android') {
  var PushNotification = require('react-native-push-notification');
}

export default class PushNotificationService {
  constructor(onNotification) {
    this.init(onNotification);
  }

  init(onNotification) {
    if (Platform.OS === 'ios') return;

    PushNotification.configure({
      onRegister: this.subscribe,
      onNotification: onNotification,
      senderID: appConfig.senderID,
    });
  }

  subscribe(register) {
    const DeviceInfo = require('react-native-device-info').default;

    const params = {
      notification_channels: Platform.OS === 'ios' ? 'apns' : 'gcm',
      device: {
        platform: Platform.OS,
        udid: DeviceInfo.getUniqueID(),
      },
      push_token: {
        environment: 'development',
        client_identification_sequence: register.token,
      },
    };

    ConnectyCube.pushnotifications.subscriptions.create(
      params,
      (error, response) => {},
    );
  }
}
