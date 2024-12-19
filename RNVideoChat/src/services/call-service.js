import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import { CONSTANTS as CK_CONSTANTS } from 'react-native-callkeep';
import { showToast, getUserById, getCallRecipientString, platformOS, isAndroid } from '../utils';
import store from '../redux/store';
import {
  upsertStreams,
  removeStream,
  resetActiveCall,
  setCallSession,
  acceptCall,
  earlyAcceptCall,
  muteMicrophone,
} from '../redux/slices/activeCall';
import CallKeepService from './call-keep-service';

const LOCAL_STREAM_USER_ID = 'localStream';

class CallService {
  static MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };

  mediaDevices = [];

  _outgoingCallSound = null;
  _incomingCallSound = null;
  _endCallSound = null;

  constructor() {
    if (CallService.instance) {
      return CallService.instance;
    }

    CallService.instance = this;

    this._outgoingCallSound = new Sound(require('../../assets/sounds/dialing.mp3'));
    this._incomingCallSound = new Sound(require('../../assets/sounds/calling.mp3'));
    this._endCallSound = new Sound(require('../../assets/sounds/end_call.mp3'));
  }

  registerEvents() {
    ConnectyCube.videochat.onCallListener = this._onCallListener.bind(this);
    ConnectyCube.videochat.onAcceptCallListener = this._onAcceptCallListener.bind(this);
    ConnectyCube.videochat.onRejectCallListener = this._onRejectCallListener.bind(this);
    ConnectyCube.videochat.onStopCallListener = this._onStopCallListener.bind(this);
    ConnectyCube.videochat.onUserNotAnswerListener = this._onUserNotAnswerListener.bind(this);
    ConnectyCube.videochat.onRemoteStreamListener = this._onRemoteStreamListener.bind(this);
  }

  get currentUser() {
    return store.getState().currentUser;
  }

  get callSession() {
    return store.getState().activeCall.session;
  }

  get streams() {
    return store.getState().activeCall.streams;
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
  async startCall(usersIds, callType, options = {}) {
    const session = ConnectyCube.videochat.createNewSession(usersIds, callType, options);

    store.dispatch(setCallSession({ session, isIncoming: false }));
    await this.setMediaDevices();

    const mediaOptions = { ...CallService.MEDIA_OPTIONS }; // create local stream

    if (callType === ConnectyCube.videochat.CallType.AUDIO) {
      mediaOptions.video = false;
    }

    const stream = await this.callSession.getUserMedia(mediaOptions);
    const streams = [{ userId: LOCAL_STREAM_USER_ID, stream: stream }]; // store streams

    for (let userId of usersIds) {
      streams.push({ userId, stream: null });
    }

    store.dispatch(upsertStreams(streams));

    this.callSession.call({});

    if (isAndroid) {
      CallKeepService.reportStartCall(
        this.callSession.ID,
        this.currentUser?.full_name,
        getCallRecipientString(usersIds),
        'generic',
        callType === 'video'
      );
    }

    this.playSound('outgoing');
    this.setSpeakerphoneOn(this.callSession.callType === ConnectyCube.videochat.CallType.VIDEO);

    return session;
  }

  async acceptCall(options = {}, skipCallKit = false) {
    if (this.isDummySession) {
      store.dispatch(earlyAcceptCall());
      console.log('[acceptCall] earlyAcceptCall');
      return;
    }

    this.stopSounds();

    console.log('[acceptCall]');

    await this.setMediaDevices();

    // create local stream
    const mediaOptions = { ...CallService.MEDIA_OPTIONS };
    if (this.callSession.callType === ConnectyCube.videochat.CallType.AUDIO) {
      mediaOptions.video = false;
    }
    const stream = await this.callSession.getUserMedia(mediaOptions);

    // store streams
    const streams = [{ userId: LOCAL_STREAM_USER_ID, stream: stream }];
    const opponentsIds = [this.callSession.initiatorID,
    ...this.callSession.opponentsIDs.filter(oid => oid !== this.callSession.currentUserID)];
    for (let userId of opponentsIds) {
      streams.push({ userId, stream: null });
    }
    store.dispatch(upsertStreams(streams));

    this.callSession.accept(options);

    if (!skipCallKit) {
      CallKeepService.reportAcceptCall(this.callSession.ID);
    }

    store.dispatch(acceptCall());

    this.setSpeakerphoneOn(this.callSession.callType === ConnectyCube.videochat.CallType.VIDEO);
  }

  stopCall(options = {}, skipCallKit = false) {
    this.stopSounds();

    if (this.callSession) {
      this.callSession.stop?.(options);
      ConnectyCube.videochat.clearSession(this.callSession.ID);

      this.playSound('end');

      if (!skipCallKit) {
        CallKeepService.reportEndCall(this.callSession.ID);
      }

      store.dispatch(resetActiveCall());
    }
  }

  rejectCall(options = {}, skipCallKit = false) {
    this.stopSounds();

    if (this.callSession) {
      if (this.isDummySession) {
        ConnectyCube.videochat.callRejectRequest({
          sessionID: this.callSession.ID,
          platform: platformOS,
          recipientId: this.callSession.initiatorID,
        }).then(res => {
          this.stopSounds();
          console.log('[CallKitService][rejectCall] [callRejectRequest] done');
        });
      } else {
        this.callSession.reject(options);
      }

      if (!skipCallKit) {
        CallKeepService.reportRejectCall(this.callSession.ID);
      }

      store.dispatch(resetActiveCall());
    }
  }

  muteMicrophone(isMute, skipCallKit = false) {
    if (isMute) {
      this.callSession?.mute('audio');
    } else {
      this.callSession?.unmute('audio');
    }

    store.dispatch(muteMicrophone(isMute));

    if (!skipCallKit) {
      CallKeepService.reportMutedCall(this.callSession?.ID, isMute);
    }
  }

  switchCamera() {
    const localStream = this.streams.filter(s => s.userId === LOCAL_STREAM_USER_ID)[0];
    localStream.stream.getVideoTracks().forEach(track => track._switchCamera());
  }

  setSpeakerphoneOn = flag => InCallManager.setSpeakerphoneOn(flag);

  playSound(type) {
    switch (type) {
      case 'outgoing':
        if (!this._outgoingCallSound.isPlaying()) {
          this._outgoingCallSound.setNumberOfLoops(-1);
          this._outgoingCallSound.play();
        }
        break;
      case 'incoming':
        if (!this._incomingCallSound.isPlaying() && !this.isAccepted) {
          this._incomingCallSound.setNumberOfLoops(-1);
          this._incomingCallSound.play();
        }
        break;
      case 'end':
        this._endCallSound.play();
        break;

      default:
        break;
    }
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
    this.mediaDevices = await ConnectyCube.videochat.getMediaDevices();
  }

  async _onCallListener(session, extension) {
    // if already on a call
    if (this.callSession && !this.isDummySession) {
      console.log('[CallService][_onCallListener] reject, already_on_call');
      this.rejectCall(session, { already_on_call: true });
      return;
    }

    store.dispatch(setCallSession({ session, isIncoming: true }));

    console.log('[CallService][_onCallListener]', { isEarlyAccepted: this.isEarlyAccepted, isAccepted: this.isAccepted });

    if (this.isEarlyAccepted && !this.isAccepted) {
      setTimeout(() => {
        this.acceptCall();
      });
    }

    this.playSound('incoming');
  }

  async _onAcceptCallListener(session, userId, extension) {
    console.log('_onAcceptCallListener', userId);

    if (this.callSession) {
      this.stopSounds();
    }

    showToast(`${getUserById(userId, 'full_name')} has accepted the call`);
  }

  async _onRejectCallListener(session, userId, extension) {
    store.dispatch(removeStream({ userId }));

    const userName = getUserById(userId, 'full_name');
    const message = extension.already_on_call
      ? `${userName} is busy (already on a call)`
      : `${userName} rejected the call request`;

    showToast(message);
  }

  async _onStopCallListener(session, userId, extension) {
    this.stopSounds();

    const userName = getUserById(userId, 'full_name');
    const message = `${userName} has left the call`;

    showToast(message);

    store.dispatch(removeStream({ userId }));
    if (this.streams.length <= 1) {
      store.dispatch(resetActiveCall());
      CallKeepService.reportEndCallWithoutUserInitiating(session.ID, CK_CONSTANTS.END_CALL_REASONS.REMOTE_ENDED);
    }
  }

  async _onUserNotAnswerListener(session, userId) {
    showToast(`${getUserById(userId, 'full_name')} did not answer`);

    store.dispatch(removeStream({ userId }));
  }

  async _onRemoteStreamListener(session, userId, stream) {
    store.dispatch(upsertStreams([{ userId, stream }]));
  }
}

export default new CallService();
