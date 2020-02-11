import PushNotification from 'react-native-push-notification'
import ConnectyCube from 'react-native-connectycube'
import store from '../store'
import { Platform } from 'react-native'
import appConfig from '../../config.json'
import AsyncStorage from '@react-native-community/async-storage'
import Dialog from '../models/dialogs'
import User from '../models/user'
import { addNewDialog } from '../actions/dialogs'
import { fetchUsers } from '../actions/users'

class PushNotificationService {
  static DEVICE_TOKEN_KEY = 'DEVICE_TOKEN_KEY'
  static Navigation = null

  init(navigation) {
    PushNotificationService.Navigation = navigation
    const settings = {
      onRegister: this.subcribeToPushNotification,
      onNotification: this.onNotification,
      popInitialNotification: true,
      requestPermissions: true
    }
    if (Platform.OS !== 'ios') {
      settings.senderID = appConfig.senderID
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
        AsyncStorage.setItem(PushNotificationService.DEVICE_TOKEN_KEY, `${result[0].subscription.id}`)
      })
      .catch(error => {
        console.log('PushNotificationService - error', error)
      })
  }

  async onNotification(notification) {
    console.log("NOTIFICATION:", notification)
    let dialogId = null
    if (Platform.OS === 'ios') {
      dialogId = notification.data.dialog_id
    } else {
      dialogId = notification.dialog_id
    }
    if (notification.userInteraction && dialogId !== PushNotificationService.getSelectedDialog()) {
      const dialog = await PushNotificationService.getDialogById(dialogId)
      PushNotificationService.Navigation.push('Chat', { dialog })
    }
  }

  static async getDialogById(dialogId) {
    const getDialog = store.getState().dialogs.find(elem => elem.id === dialogId)
    if (getDialog) {
      return getDialog
    } else {
      const filters = {
        _id: {
          in: dialogId
        }
      }
      // get Dialog from server
      const dialogsFromServer = await ConnectyCube.chat.dialog.list(filters)
      const dialog = new Dialog(dialogsFromServer.items[0])

      // get User from server
      const currentUser = dialog.user_id
      const participantId = dialog.occupants_ids.find(elem => elem.id !== currentUser)
      const responseUser = await ConnectyCube.users.get(participantId)
      const user = new User(responseUser.user)
      store.dispatch(fetchUsers([user]))
      store.dispatch(addNewDialog(dialog))
      return dialog
    }
  }

  static getSelectedDialog() {
    return store.getState().selectedDialog
  }

}

// create instance
const pushNotificationService = new PushNotificationService()

Object.freeze(pushNotificationService)

export default pushNotificationService

