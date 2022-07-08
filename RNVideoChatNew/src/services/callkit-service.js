import { getApplicationName } from 'react-native-device-info';
import RNCallKeep from 'react-native-callkeep';

class CallKitService {
  constructor() {
    this.currentCallId = null;
  }

  init() {
    console.log('[CallKitService][init]', !!RNCallKeep);

    const options = {
      ios: {
        appName: getApplicationName(),
      },
      android: {
        selfManaged: true,
        alertTitle: 'Permissions required',
        alertDescription: 'This application needs to access your phone accounts',
        cancelButton: 'Cancel',
        okButton: 'ok',
        imageName: 'phone_account_icon',
        additionalPermissions: [/*PermissionsAndroid.PERMISSIONS.example*/],
        // Required to get audio in background when using Android 11
        foregroundService: {
          channelId: 'com.company.my',
          channelName: 'Foreground service for my app',
          notificationTitle: 'My app is running on background',
          notificationIcon: 'Path to the resource icon of the notification',
        }, 
      }
    };

    RNCallKeep.setup(options).then(accepted => {
      console.log('[CallKitService][setup] Ok');
    }).catch(err => {
      console.error('[CallKitService][setup] Error:', err.message);
    });

    // Add RNCallKeep Events
    RNCallKeep.addEventListener('didReceiveStartCallAction', this.didReceiveStartCallAction);
    RNCallKeep.addEventListener('answerCall', this.onAnswerCallAction);
    RNCallKeep.addEventListener('endCall', this.onEndCallAction);
    RNCallKeep.addEventListener('didDisplayIncomingCall', this.onIncomingCallDisplayed);
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', this.onToggleMute);
    RNCallKeep.addEventListener('didToggleHoldCallAction', this.onToggleHold);
    RNCallKeep.addEventListener('didPerformDTMFAction', this.onDTMFAction);
    RNCallKeep.addEventListener('didActivateAudioSession', this.audioSessionActivated);
    RNCallKeep.addEventListener('showIncomingCallUi', this.showIncomingCallUi);
  }

  // API
  //

  displayIncomingCall(callUUID, handle, localizedCallerName = '', handleType = 'number', hasVideo = false, options = null){
    console.log('[CallKitService][displayIncomingCall]', {callUUID, handle, localizedCallerName, handleType, hasVideo, options});

    RNCallKeep.displayIncomingCall(callUUID, handle, localizedCallerName, handleType, hasVideo, options);
  }

  // Use startCall to ask the system to start a call - Initiate an outgoing call from this point
  reportStartCall(callUUID, handle, contactIdentifier, handleType, hasVideo){
    console.log('[CallKitService][reportStartCall]', callUUID, handle, contactIdentifier, handleType, hasVideo);

    // Your normal start call action
    RNCallKeep.startCall(callUUID, handle, contactIdentifier, handleType, hasVideo);
  };

  reportEndCallWithUUID(callUUID, reason){
    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  }

  // Event Listener Callbacks
  //

  showIncomingCallUi = ({ handle, callUUID, name }) => {
    console.log('[CallKitService][showIncomingCallUi]', {handle, callUUID, name});
  }

  didReceiveStartCallAction = (data) => {
    console.log('[CallKitService][didReceiveStartCallAction]', data);

    let { handle, callUUID, name } = data;
    // Get this event after the system decides you can start a call
    // You can now start a call from within your app
  };

  onAnswerCallAction = (data) => {
    console.log('[CallKitService][onAnswerCallAction]', data);

    let { callUUID } = data;
    // Called when the user answers an incoming call
  };

  onEndCallAction = (data) => {
    console.log('[CallKitService][onEndCallAction]', data);

    let { callUUID } = data;
    RNCallKeep.endCall(callUUID);

    this.currentCallId = null;
  };

  // Currently iOS only
  onIncomingCallDisplayed = (data) => {
    console.log('[CallKitService][onIncomingCallDisplayed]', data);

    let { error } = data;
    // You will get this event after RNCallKeep finishes showing incoming call UI
    // You can check if there was an error while displaying
  };

  onToggleMute = (data) => {
    let { muted, callUUID } = data;
    // Called when the system or user mutes a call
  };

  onToggleHold = (data) => {
    let { hold, callUUID } = data;
    // Called when the system or user holds a call
  };

  onDTMFAction = (data) => {
    let { digits, callUUID } = data;
    // Called when the system or user performs a DTMF action
  };

  audioSessionActivated = (data) => {
    console.log('[CallKitService][audioSessionActivated]', data);

    // you might want to do following things when receiving this event:
    // - Start playing ringback if it is an outgoing call
  };
}

const callKitService = new CallKitService();
export default callKitService;