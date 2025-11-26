import { ConnectyCube } from '@connectycube/react';
import DeviceInfo from 'react-native-device-info';
import RNCallKeep from 'react-native-callkeep';
import { isIOS, platformOS, wait } from '../utils';
import CallService from './call-service';
import NativeLocalStorage from '../../specs/NativeLocalStorage';
import { AuthService } from '.';

class CallKeepService {
  constructor() {
    if (CallKeepService.instance) {
      return CallKeepService.instance;
    }

    CallKeepService.instance = this;
  }

  async setup() {
    if (!isIOS) { return; }

    try {
      const options = {
        ios: {
          appName: DeviceInfo.getApplicationName(),
          includesCallsInRecents: false,
        },
      };

      await RNCallKeep.setup(options);
    } catch (err) {
      console.error(platformOS, '[CallKeepService][setup] Error:', err.message);
    }

    this.registerEvents();
  }

  async registerEvents() {
    if (!isIOS) { return; }
    // Add RNCallKeep Events
    RNCallKeep.addEventListener('didReceiveStartCallAction', this.didReceiveStartCallAction);
    RNCallKeep.addEventListener('answerCall', this.onAnswerCallAction);
    RNCallKeep.addEventListener('endCall', this.onEndCallAction);
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', this.onToggleMute);
    RNCallKeep.addEventListener('didChangeAudioRoute', this.onChangeAudioRoute);
    RNCallKeep.addEventListener('didLoadWithEvents', this.onLoadWithEvents);
    RNCallKeep.addEventListener('didDisplayIncomingCall', this.onDisplayIncomingCall);
  }

  // displayIncomingCall(payload) {
  //   if (!isIOS) { return; }
  //   RNCallKeep.displayIncomingCall(
  //     payload?.uuid || '',
  //     payload?.handle || payload.initiatorId || 'Unknown',
  //     payload?.message || 'Incoming call',
  //     'generic',
  //     true,
  //     {}
  //   );
  // }

  // Use startCall to ask the system to start a call - Initiate an outgoing call from this point
  reportStartCall(callUUID, handle, contactIdentifier, handleType, hasVideo) {
    if (!isIOS) { return; }
    console.log(platformOS, '[CallKeepService][reportStartCall]', callUUID, handle, contactIdentifier, handleType, hasVideo);
    // Your normal start call action
    RNCallKeep.startCall(callUUID, handle, contactIdentifier, handleType, hasVideo);
  }

  reportAcceptCall(callUUID) {
    if (!isIOS) { return; }
    console.log(platformOS, '[CallKeepService][reportAcceptCall]', callUUID);
    // Your normal start call action
    RNCallKeep.answerIncomingCall(callUUID);
  }

  reportRejectCall(callUUID) {
    if (!isIOS) { return; }
    console.log(platformOS, '[CallKeepService][reportRejectCall]', callUUID);
    RNCallKeep.rejectCall(callUUID);
  }

  reportEndCall(callUUID) {
    if (!isIOS) { return; }
    console.log(platformOS, '[CallKeepService][reportEndCall]', callUUID);
    RNCallKeep.endCall(callUUID);
  }

  reportMutedCall(callUUID, isMuted) {
    if (!isIOS) { return; }
    console.log(platformOS, '[CallKeepService][reportEndCall]', { callUUID, isMuted });
    RNCallKeep.setMutedCall(callUUID, isMuted);
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
  reportEndCallWithoutUserInitiating(callUUID, reason) {
    if (!isIOS) { return; }
    console.log(platformOS, '[CallKeepService][reportEndCallWithoutUserInitiating]', callUUID, reason);
    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  }

  onDisplayIncomingCall = (data) => {
    console.log(platformOS, '[CallKeepService][reportStartCall]', data);
  };

  didReceiveStartCallAction = (data) => {
    console.log(platformOS, '[CallKeepService][didReceiveStartCallAction]', data);
    // Get this event after the system decides you can start a call
    // You can now start a call from within your app
  };

  onAnswerCallAction = async (data) => {
    console.log(platformOS, '[CallKeepService][onAnswerCallAction]', data);
    const sessionInfo = this.getSessionInfoByCallUUID(data.callUUID);

    if (!CallService.callSession) {
      CallService.createDummyCallSession(sessionInfo);
      await wait();
    }

    CallService.acceptCall({}, true);
  };

  onEndCallAction = async (data) => {
    console.log(platformOS, '[CallKeepService][onEndCallAction]', data);

    const sessionInfo = this.getSessionInfoByCallUUID(data.callUUID);

    if (!CallService.callSession) {
      CallService.createDummyCallSession(sessionInfo);
      AuthService.getUserFromAsyncStorage().then(ConnectyCube.createSession).then(() => {
        CallService.rejectCall({}, true);
      });

      return;
    }

    if (CallService.isAccepted) {
      CallService.stopCall({}, true);
    } else {
      CallService.rejectCall({}, true);
    }
  };

  onToggleMute = (data) => {
    console.log(platformOS, '[CallKeepService][onToggleMute]', data);
    CallService.muteMicrophone(data.muted, true);
  };

  onChangeAudioRoute = (data) => {
    console.log(platformOS, '[CallKeepService][onChangeAudioRoute]', data);
  };

  onLoadWithEvents = (events) => {
    console.log(platformOS, '[CallKeepService][onLoadWithEvents]', events);

    // `events` is passed as an Array chronologically, handle or ignore events based on the app's logic
    // see example usage in https://github.com/react-native-webrtc/react-native-callkeep/pull/169 or https://github.com/react-native-webrtc/react-native-callkeep/pull/205

    // Example:
    // [
    //   {"data": {"callUUID": "858c869d-96b1-40bf-a742-846bfb450dd6", "error": "", "errorCode": "", "fromPushKit": "1", "handle": "Dexter", "hasVideo": "1", "localizedCallerName": "Dexter", "payload": [Object], "supportsDTMF": "1", "supportsGrouping": "1", "supportsHolding": "1", "supportsUngrouping": "1"}, "name": "RNCallKeepDidDisplayIncomingCall"},
    //   {"data": {"callUUID": "858c869d-96b1-40bf-a742-846bfb450dd6"}, "name": "RNCallKeepPerformAnswerCallAction"},
    //   {"name": "RNCallKeepDidActivateAudioSession"}
    // ]

    let callDataToAdd = null;
    let callDataToAnswer = null;
    let callDataToReject = null;

    for (let event of events) {
      const { name, data } = event;
      if (name === 'RNCallKeepDidDisplayIncomingCall') {
        callDataToAdd = data;
        callDataToAnswer = null;
        callDataToReject = null;
      }
      if (name === 'RNCallKeepPerformAnswerCallAction') {
        callDataToReject = null;
        callDataToAnswer = data;
      }
    }

    console.log(platformOS, '[CallKeepService][onLoadWithEvents]', { callDataToAdd, callDataToAnswer });

    if (callDataToAdd) {
      if (callDataToAnswer) {
        // Called when the user answers an incoming call via Call Kit
        if (!CallService.isAccepted) {
          console.log(platformOS, '[CallKeepService][onLoadWithEvents] acceptCall');
          CallService.acceptCall({}, true);
        }
      }
    }
  };

  getSessionInfoByCallUUID = (uuid) => {
    try {
      const jsonCallInfo = NativeLocalStorage?.getItem(uuid);
      return jsonCallInfo ? JSON.parse(jsonCallInfo) : { uuid };
    } catch (error) {
      return { uuid };
    }
  };
}

export default new CallKeepService();
