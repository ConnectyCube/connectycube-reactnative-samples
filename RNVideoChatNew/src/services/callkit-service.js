import { getApplicationName } from 'react-native-device-info';
import RNCallKeep, { CONSTANTS as CK_CONSTANTS } from 'react-native-callkeep';

class CallKitService {
  constructor() {
    this.currentCallId = null;
  }

  init() {
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][init]', !!RNCallKeep);

    const options = {
      ios: {
        appName: getApplicationName(),
        includesCallsInRecents: true,
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

    const initialEvents = RNCallKeep.getInitialEvents();
    console.log("[CallKitService] initialEvents", initialEvents);
  }

  // API
  //

  displayIncomingCall(callUUID, handle, localizedCallerName = '', handleType = 'number', hasVideo = false, options = null){
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][displayIncomingCall]', {callUUID, handle, localizedCallerName, handleType, hasVideo, options});

    RNCallKeep.displayIncomingCall(callUUID, handle, localizedCallerName, handleType, hasVideo, options);
  }

  // Use startCall to ask the system to start a call - Initiate an outgoing call from this point
  reportStartCall(callUUID, handle, contactIdentifier, handleType, hasVideo){
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][reportStartCall]', callUUID, handle, contactIdentifier, handleType, hasVideo);

    // Your normal start call action
    RNCallKeep.startCall(callUUID, handle, contactIdentifier, handleType, hasVideo);
  };

  reportAcceptCall(callUUID){
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][reportAcceptCall]', callUUID);

    // Your normal start call action
    RNCallKeep.answerIncomingCall(callUUID);
  }

  reportRejectCall(callUUID){
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][reportRejectCall]', callUUID);

    RNCallKeep.rejectCall(callUUID);
  }

  reportEndCall(callUUID){
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][reportEndCall]', callUUID);

    RNCallKeep.endCall(callUUID);
  }

  // Report that the call ended without the user initiating.
  // https://github.com/react-native-webrtc/react-native-callkeep#reportEndCallWithUUID
  //
  // END_CALL_REASONS: {
  //   FAILED: 1,
  //   REMOTE_ENDED: 2,
  //   UNANSWERED: 3,
  //   ANSWERED_ELSEWHERE: 4,
  //   DECLINED_ELSEWHERE: 5 | 2,
  //   MISSED: 2 | 6
  // }
  reportEndCallWithoutUserInitiating(callUUID, reason){
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][reportEndCallWithoutUserInitiating]', callUUID, reason);

    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  }

  // Event Listener Callbacks
  //

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

export const END_CALL_REASONS = CK_CONSTANTS.END_CALL_REASONS;