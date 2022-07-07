import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';

import { showToast, getUserById } from '../utils'
import store from '../store'
import { addOrUpdateStream, removeStream, resetActiveCall, setCallSession } from '../actions/activeCall'

const LOCAL_STREAM_USER_ID = 'localStream';

export default class CallService {
  static MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };

  mediaDevices = [];

  _outgoingCallSound = null
  _incomingCallSound = null
  _endCallSound = null

  constructor() {
    this._outgoingCallSound = new Sound(require('../../assets/sounds/dialing.mp3'))
    this._incomingCallSound = new Sound(require('../../assets/sounds/calling.mp3'))
    this._endCallSound = new Sound(require('../../assets/sounds/end_call.mp3'))

    ConnectyCube.videochat.onCallListener = this._onCallListener.bind(this);
    ConnectyCube.videochat.onAcceptCallListener = this._onAcceptCallListener.bind(this);
    ConnectyCube.videochat.onRejectCallListener = this._onRejectCallListener.bind(this);
    ConnectyCube.videochat.onStopCallListener = this._onStopCallListener.bind(this);
    ConnectyCube.videochat.onUserNotAnswerListener = this._onUserNotAnswerListener.bind(this);
    ConnectyCube.videochat.onRemoteStreamListener = this._onRemoteStreamListener.bind(this);
  }

  get callSession() {
    return store.getState().activeCall.session;
  }

  get streams() {
    return store.getState().activeCall.streams;
  }

  // callbacks
  //

  async _onCallListener(session, extension){
    // if already on a call
    if (this.callSession) {
      this.rejectCall(session, { already_on_call: true });
      return;
    }

    this.playSound('incoming');

    store.dispatch(setCallSession(session, true));
  };

  async _onAcceptCallListener(session, userId, extension){
    console.log("_onAcceptCallListener", userId);

    if (this.callSession) {
      this.stopSounds();
    }
    
    showToast(`${getUserById(userId, 'name')} has accepted the call`);
  };

  async _onRejectCallListener(session, userId, extension){
    store.dispatch(removeStream({userId}))

    const userName = getUserById(userId, 'name');
    const message = extension.already_on_call
      ? `${userName} is busy (already on a call)`
      : `${userName} rejected the call request`;

    showToast(message);
  };

  async _onStopCallListener (session, userId, extension){
    this.stopSounds();

    const userName = getUserById(userId, 'name');
    const message = `${userName} has left the call`;

    showToast(message);

    store.dispatch(removeStream({userId}));
    console.log("_onStopCallListener", this.streams.length)
    if (this.streams.length <= 1) {
      store.dispatch(resetActiveCall());
    }
  };

  async _onUserNotAnswerListener(session, userId){
    showToast(`${getUserById(userId, 'name')} did not answer`);

    store.dispatch(removeStream({userId}));
  };

  async _onRemoteStreamListener(session, userId, stream){
    store.dispatch(addOrUpdateStream({userId, stream}));
  };


  // API
  //

  async startCall(usersIds, type, options = {}) {
    const session = ConnectyCube.videochat.createNewSession(usersIds, type, options);
    store.dispatch(setCallSession(session));

    await this.setMediaDevices();

    // create and store local streams
    const stream = await this.callSession.getUserMedia(CallService.MEDIA_OPTIONS)
    store.dispatch(addOrUpdateStream({userId: LOCAL_STREAM_USER_ID, stream: stream}));

    // store dummy remote streams  
    for (uId of usersIds) {
      store.dispatch(addOrUpdateStream({userId: uId, stream: null}));
    }

    this.callSession.call({});

    this.playSound('outgoing');
  }

  async acceptCall(options = {}) {
    await this.setMediaDevices();

    // create and store local streams
    const stream = await this.callSession.getUserMedia(CallService.MEDIA_OPTIONS)
    store.dispatch(addOrUpdateStream({userId: LOCAL_STREAM_USER_ID, stream: stream}));

    // store dummy remote streams  
    const opponentsIds = [this.callSession.initiatorID, 
                          ...this.callSession.opponentsIDs.filter(oid => oid !== this.callSession.currentUserID)]
    for (uId of opponentsIds) {
      store.dispatch(addOrUpdateStream({userId: uId, stream: null}));
    }

    console.log("this.callSession", opponentsIds, store.getState().activeCall)

    this.callSession.accept(options);

    this.stopSounds();
  }

  stopCall(options = {}) {
    if (this.callSession) {
      this.callSession.stop(options);
      ConnectyCube.videochat.clearSession(this.callSession.ID);

      this.playSound('end');

      store.dispatch(resetActiveCall());
    }

    this.stopSounds();
  }

  rejectCall(options = {}) {
    if (this.callSession) {
      this.callSession.reject(options);
    }

    this.stopSounds();
  }

  muteMicrophone(isMute) {
    if (isMute) {
      this.callSession.mute('audio');
    } else {
      this.callSession.unmute('audio');
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
}
