import PushNotification from 'react-native-push-notification'
import ConnectyCube from 'react-native-connectycube'
import { Platform } from 'react-native'
import config from '../config';
import RNCallKeep from 'react-native-callkeep';
import { PermissionsAndroid } from "react-native";

// import AsyncStorage from '@react-native-community/async-storage'

class PushNotificationService {
  static DEVICE_TOKEN_KEY = 'DEVICE_TOKEN_KEY'

  init() {
    const settings = {
      onRegister: this.subcribeToPushNotification,
      onNotification: this.onNotification,
      popInitialNotification: true,
      requestPermissions: true
    }
    if (Platform.OS !== 'ios') {
      settings.senderID = config[0].senderID
    } else {
      settings.permissions = {
        alert: true,
        badge: true,
        sound: true
      }
    }
    
    PushNotification.configure(settings)
  }

  async subcribeToPushNotification(token) {
    const DeviceInfo = require('react-native-device-info').default

    const params = {
      notification_channels: Platform.OS === 'ios' ? 'apns' : 'gcm',
      device: {
        platform: Platform.OS,
        udid: DeviceInfo.getUniqueId()
      },
      push_token: {
        environment: __DEV__ ? 'development' : 'production',
        client_identification_sequence: token.token
      }
    }

    ConnectyCube.pushnotifications.subscriptions.create(params)
      .then(result => {
        console.log('PushNotificationService - result', result)
        // AsyncStorage.setItem(PushNotificationService.DEVICE_TOKEN_KEY, `${result[0].subscription.id}`)
      })
      .catch(error => {
        console.log('PushNotificationService - error', error)
      })
  }

  async onNotification(notification) {

    console.warn('onNotification-push')
    await RNCallKeep.displayIncomingCall('uuid', 'handle', 'localizedCallerName');

    // onMessageReceived - Java
    
    const options = {
      ios: {
        appName: 'My app name',
      },
      android: {
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'ok',
        imageName: 'phone_account_icon',
        additionalPermissions: [PermissionsAndroid.PERMISSIONS.CALL_PHONE]
      }
    };
    
    RNCallKeep.setup(options).then(accepted => {
      console.warn('RNCallKeep.setup')
    });
  }

}


const pushNotificationService = new PushNotificationService()

Object.freeze(pushNotificationService)

export default pushNotificationService
