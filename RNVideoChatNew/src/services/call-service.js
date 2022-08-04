import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import { getApplicationName } from 'react-native-device-info';
import RNCallKeep, { CONSTANTS as CK_CONSTANTS } from 'react-native-callkeep';
import RNUserdefaults from '@tranzerdev/react-native-user-defaults';

import { showToast, getUserById, getCallRecipientString } from '../utils'
import store from '../store'
import { 
  addOrUpdateStreams, 
  removeStream, 
  resetActiveCall, 
  setCallSession, 
  acceptCall, 
  earlyAcceptCall, 
  muteMicrophone } from '../actions/activeCall'

const LOCAL_STREAM_USER_ID = 'localStream';

class CallService {
  static MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };

  mediaDevices = [];

  _outgoingCallSound = null
  _incomingCallSound = null
  _endCallSound = null

  constructor() {
    this._outgoingCallSound = new Sound(require('../../assets/sounds/dialing.mp3'))
    this._incomingCallSound = new Sound(require('../../assets/sounds/calling.mp3'))
    this._endCallSound = new Sound(require('../../assets/sounds/end_call.mp3'))
  }

  init() {
    ConnectyCube.videochat.onCallListener = this._onCallListener.bind(this);
    ConnectyCube.videochat.onAcceptCallListener = this._onAcceptCallListener.bind(this);
    ConnectyCube.videochat.onRejectCallListener = this._onRejectCallListener.bind(this);
    ConnectyCube.videochat.onStopCallListener = this._onStopCallListener.bind(this);
    ConnectyCube.videochat.onUserNotAnswerListener = this._onUserNotAnswerListener.bind(this);
    ConnectyCube.videochat.onRemoteStreamListener = this._onRemoteStreamListener.bind(this);

    this.initCallKit();
  }

  initCallKit() {
    if (Platform.OS !== 'ios') {
      return;
    }

    const options = {
      ios: {
        appName: getApplicationName(),
        includesCallsInRecents: false,
      }
    };

    RNCallKeep.setup(options).then(accepted => {
      console.log('[CallKitService][setup] Ok');
    }).catch(err => {
      console.error('[CallKitService][setup] Error:', err.message);
    });

    // Add RNCallKeep Events
    // RNCallKeep.addEventListener('didReceiveStartCallAction', this.didReceiveStartCallAction);
    RNCallKeep.addEventListener('answerCall', this.onAnswerCallAction);
    RNCallKeep.addEventListener('endCall', this.onEndCallAction);
    RNCallKeep.addEventListener('didPerformSetMutedCallAction', this.onToggleMute);
    RNCallKeep.addEventListener('didChangeAudioRoute', this.onChangeAudioRoute);
    RNCallKeep.addEventListener('didLoadWithEvents', this.onLoadWithEvents);
  }

  get callSession() {
    return store.getState().activeCall.session;
  }

  get streams() {
    return store.getState().activeCall.streams;
  }

  get currentUser() {
    return store.getState().currentUser;
  }

  get isEarlyAccepted() {
    return store.getState().activeCall.isEarlyAccepted;
  }

  get isAccepted() {
    return store.getState().activeCall.isAccepted;
  }

  get isDummySession() {
    return store.getState().activeCall.isDummySession; 
  }

  // Call API
  //

  async startCall(usersIds, callType, options = {}) {
    const session = ConnectyCube.videochat.createNewSession(usersIds, callType, options);
    store.dispatch(setCallSession(session));

    await this.setMediaDevices();

    // create local stream
    const mediaOptions = {...CallService.MEDIA_OPTIONS};
    if (callType === ConnectyCube.videochat.CallType.AUDIO) {
      mediaOptions.video = false;
    }
    const stream = await this.callSession.getUserMedia(mediaOptions)

    // store streams
    const streams = [{userId: LOCAL_STREAM_USER_ID, stream: stream}]
    for (uId of usersIds) {
      streams.push({userId: uId, stream: null})
    }
    store.dispatch(addOrUpdateStreams(streams));

    this.callSession.call({});

    // report to CallKit (iOS only)
    this.reportStartCall(
      this.callSession.ID,
      this.currentUser.full_name,
      getCallRecipientString(usersIds),
      "generic",
      callType === "video"
    );


    this.playSound('outgoing');

    return session;
  }

  async acceptCall(options = {}, skipCallKit = false) {  
    if (!this.callSession || this.isDummySession) {
      store.dispatch(earlyAcceptCall());
      console.log("[acceptCall] earlyAcceptCall");
      return;
    }

    console.log("[acceptCall]");

    await this.setMediaDevices();

    // create local stream
    const mediaOptions = {...CallService.MEDIA_OPTIONS};
    if (this.callSession.callType === ConnectyCube.videochat.CallType.AUDIO) {
      mediaOptions.video = false;
    }
    const stream = await this.callSession.getUserMedia(mediaOptions)
   
    // store streams
    const streams = [{userId: LOCAL_STREAM_USER_ID, stream: stream}]
    const opponentsIds = [this.callSession.initiatorID, 
                          ...this.callSession.opponentsIDs.filter(oid => oid !== this.callSession.currentUserID)]
    for (uId of opponentsIds) {
      streams.push({userId: uId, stream: null});
    }
    store.dispatch(addOrUpdateStreams(streams));

    this.callSession.accept(options);

    if (!skipCallKit) {
      // report to Call Kit (iOS only)
      this.reportAcceptCall(this.callSession.ID);
    }

    this.stopSounds();

    store.dispatch(acceptCall());
  }

  stopCall(options = {}, skipCallKit = false) {
    console.log("[CallService][stopCall]", this.callSession?.ID)
    if (this.callSession) {
      this.callSession.stop(options);
      ConnectyCube.videochat.clearSession(this.callSession.ID);

      this.playSound('end');

      if (!skipCallKit) {
        // report to Call Kit (iOS only)
        this.reportEndCall(this.callSession.ID);
      }

      store.dispatch(resetActiveCall());
    }

    this.stopSounds();
  }

  rejectCall(options = {}, skipCallKit = false) {
    if (this.callSession) {
      if (this.isDummySession) {
        ConnectyCube.videochat.callRejectRequest({
          sessionID: this.callSession.ID,
          platform: Platform.OS,
          recipientId: this.callSession.initiatorID
        }).then(res => {
          console.log("[CallKitService][rejectCall] [callRejectRequest] done")
        });
      } else {
        this.callSession.reject(options);
      }
     
      if (!skipCallKit) {
        // report to CallKit (iOS only)
        //
        this.reportRejectCall(this.callSession.ID);
      }

      store.dispatch(resetActiveCall());
    }

    this.stopSounds();
  }

  muteMicrophone(isMute, skipCallKit = false) {
    if (isMute) {
      this.callSession?.mute('audio');
    } else {
      this.callSession?.unmute('audio');
    }

    store.dispatch(muteMicrophone(isMute));
    
    if (!skipCallKit) {
      this.reportMutedCall(this.callSession?.ID, isMute);    
    }
  };

  switchCamera() {
    const localStream = this.streams.filter(s => s.userId === LOCAL_STREAM_USER_ID)[0];
    localStream.stream.getVideoTracks().forEach(track => track._switchCamera());
  }

  setSpeakerphoneOn = flag => InCallManager.setSpeakerphoneOn(flag);

  playSound(type) {
    // switch (type) {
    //   case 'outgoing':
    //     this._outgoingCallSound.setNumberOfLoops(-1);
    //     this._outgoingCallSound.play();
    //     break;
    //   case 'incoming':
    //     this._incomingCallSound.setNumberOfLoops(-1);
    //     this._incomingCallSound.play();
    //     break;
    //   case 'end':
    //     this._endCallSound.play();
    //     break;

    //   default:
    //     break;
    // }
  }

  stopSounds() {
    if (this._incomingCallSound.isPlaying()) {
      this._incomingCallSound.pause();
    }
    if (this._outgoingCallSound.isPlaying()) {
      this._outgoingCallSound.pause();
    }
  }

  async setMediaDevices() {
    const mediaDevices = await ConnectyCube.videochat.getMediaDevices();
    this.mediaDevices = mediaDevices;
  }

  // CallKit API
  //

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

  reportMutedCall(callUUID, isMuted) {
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][reportEndCall]', {callUUID, isMuted});

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
  reportEndCallWithoutUserInitiating(callUUID, reason){
    if (Platform.OS !== 'ios') {
      return;
    }

    console.log('[CallKitService][reportEndCallWithoutUserInitiating]', callUUID, reason);

    RNCallKeep.reportEndCallWithUUID(callUUID, reason);
  }


  // Call callbacks
  //

  async _onCallListener(session, extension){
    // if already on a call
    if (this.callSession && !this.isDummySession) {
      console.log("[CallService][_onCallListener] reject, already_on_call")
      this.rejectCall(session, { already_on_call: true });
      return;
    }

    this.playSound('incoming');

    console.log("[CallService][_onCallListener]", {isEarlyAccepted: this.isEarlyAccepted, isAccepted: this.isAccepted})
    if (this.isEarlyAccepted && !this.isAccepted) {
      setTimeout(() => { // wait until redux updated the data
        this.acceptCall();
      })
    }

    store.dispatch(setCallSession(session, true));
  };

  async _onAcceptCallListener(session, userId, extension){
    console.log("_onAcceptCallListener", userId);

    if (this.callSession) {
      this.stopSounds();
    }
    
    showToast(`${getUserById(userId, 'full_name')} has accepted the call`);
  };

  async _onRejectCallListener(session, userId, extension){
    store.dispatch(removeStream({userId}))

    const userName = getUserById(userId, 'full_name');
    const message = extension.already_on_call
      ? `${userName} is busy (already on a call)`
      : `${userName} rejected the call request`;

    showToast(message);
  };

  async _onStopCallListener (session, userId, extension){
    this.stopSounds();

    const userName = getUserById(userId, 'full_name');
    const message = `${userName} has left the call`;

    showToast(message);

    store.dispatch(removeStream({userId}));
    if (this.streams.length <= 1) {
      store.dispatch(resetActiveCall());

      // report to CallKit (iOS only)
      //
      this.reportEndCallWithoutUserInitiating(session.ID, CK_CONSTANTS.END_CALL_REASONS.REMOTE_ENDED);
    }
  };

  async _onUserNotAnswerListener(session, userId){
    showToast(`${getUserById(userId, 'full_name')} did not answer`);

    store.dispatch(removeStream({userId}));
  };

  async _onRemoteStreamListener(session, userId, stream){
    store.dispatch(addOrUpdateStreams([{userId, stream}]));
  };

  
  // CallKit callbacks
  //

  // didReceiveStartCallAction = (data) => {
  //   console.log('[CallKitService][didReceiveStartCallAction]', data);

  //   let { handle, callUUID, name } = data;
  //   // Get this event after the system decides you can start a call
  //   // You can now start a call from within your app
  // };

  onAnswerCallAction = (data) => {
    console.log('[CallKitService][onAnswerCallAction]', data);

    // let { callUUID } = data;

    // Called when the user answers an incoming call via Call Kit
    if (!this.isAccepted) { // by some reason, this event could fire > 1 times
      this.acceptCall({}, true);
    }
  };

  onEndCallAction = async (data) => {
    console.log('[CallKitService][onEndCallAction]', data);

    let { callUUID } = data;

    if (this.callSession) {
      if (this.isAccepted) {
        this.stopCall({}, true);
      } else {
        this.rejectCall({}, true);
      }
    } else {
      const voipIncomingCallSessions = await RNUserdefaults.get("voipIncomingCallSessions");
      if (voipIncomingCallSessions) {
        const sessionInfo = voipIncomingCallSessions[callUUID];
        if (sessionInfo) {
          const initiatorId = sessionInfo["initiatorId"];

          // most probably this is a call reject, so let's reject it via HTTP API
          ConnectyCube.videochat.callRejectRequest({
            sessionID: callUUID,
            platform: Platform.OS,
            recipientId: initiatorId
          }).then(res => {
            console.log("[CallKitService][onEndCallAction] [callRejectRequest] done")
          });
        }
      }
    }
  };

  onToggleMute = (data) => {
    console.log('[CallKitService][onToggleMute]', data);

    let { muted, callUUID } = data;
    // Called when the system or user mutes a call

    this.muteMicrophone(muted, true)
  };

  onChangeAudioRoute = (data) => {
    console.log('[CallKitService][onChangeAudioRoute]', data);

    const output = data.output;
    // could be Speaker or Receiver
  };

  onLoadWithEvents = (events) => {
    console.log('[CallKitService][onLoadWithEvents]', events);

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

    console.log('[CallKitService][onLoadWithEvents]', {callDataToAdd, callDataToAnswer});

    if (callDataToAdd) {
      if (callDataToAnswer) {
        // Called when the user answers an incoming call via Call Kit
        if (!this.isAccepted) {
          console.log('[CallKitService][onLoadWithEvents] acceptCall');
          this.acceptCall({}, true);
        }
      }
    }
  };
}

const callService = new CallService()
export default callService;
