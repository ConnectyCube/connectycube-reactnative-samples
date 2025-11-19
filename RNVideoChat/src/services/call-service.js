import { ConnectyCube, CallEvent, CallType } from '@connectycube/react';
import inCallManager from 'react-native-incall-manager';
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
  setDummyCallSession,
} from '../redux/slices/activeCall';
import CallKeepService from './call-keep-service';

const LOCAL_STREAM_USER_ID = 'localStream';

class CallService {
  static MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };

  mediaDevices = [];

  _outgoingCallSound = undefined;
  _incomingCallSound = undefined;
  _endCallSound = undefined;

  constructor() {
    if (CallService.instance) {
      return CallService.instance;
    }

    CallService.instance = this;
  }

  init() {
    ConnectyCube.videochat.addListener(CallEvent.CALL, this._onCallListener);
    ConnectyCube.videochat.addListener(CallEvent.ACCEPT, this._onAcceptCallListener);
    ConnectyCube.videochat.addListener(CallEvent.REJECT, this._onRejectCallListener);
    ConnectyCube.videochat.addListener(CallEvent.STOP, this._onStopCallListener);
    ConnectyCube.videochat.addListener(CallEvent.NOT_ANSWER, this._onUserNotAnswerListener);
    ConnectyCube.videochat.addListener(CallEvent.REMOTE_STREAM, this._onRemoteStreamListener);
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

  createDummyCallSession(data = {}) {
    const { uuid, initiatorId, opponentsIds, callType } = data;
    const session = { ID: uuid };

    if (initiatorId) session.initiatorID = initiatorId;
    if (opponentsIds) session.opponentsIDs = opponentsIds.split(',').map(Number);
    if (callType) session.callType = callType === 'video' ? CallType.VIDEO : CallType.AUDIO;

    store.dispatch(setDummyCallSession(session));
  }

  // Call API
  async startCall(usersIds, callType, options = {}) {
    const session = ConnectyCube.videochat.createNewSession(usersIds, callType, options);

    store.dispatch(setCallSession({ session, isIncoming: false }));
    await this.setMediaDevices();

    const mediaOptions = { ...CallService.MEDIA_OPTIONS }; // create local stream

    if (callType === CallType.AUDIO) {
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
    this.setSpeakerphoneOn(this.callSession.callType === CallType.VIDEO);

    return session;
  }

  async acceptCall(options = {}, skipCallKit = false) {
    this.stopSounds();

    if (this.isAccepted) {
      return;
    }

    if (this.isDummySession) {
      store.dispatch(earlyAcceptCall());
      console.log('[acceptCall] earlyAcceptCall');
      return;
    }

    console.log('[acceptCall]');

    await this.setMediaDevices();

    // create local stream
    const mediaOptions = { ...CallService.MEDIA_OPTIONS };
    if (this.callSession?.callType === CallType.AUDIO) {
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

    this.setSpeakerphoneOn(this.callSession.callType === CallType.VIDEO);
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

  setSpeakerphoneOn(flag) {
    inCallManager.setSpeakerphoneOn(flag);
  }

  playSound(type) {
    switch (type) {
      case 'outgoing':
        if (!this._outgoingCallSound) {
          this._outgoingCallSound = new Sound('dialing.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (!error) {
              this._outgoingCallSound.setNumberOfLoops(-1);
              this._outgoingCallSound.play();
            }
          });
        }
        break;
      case 'incoming':
        if (!this._incomingCallSound && !this.isAccepted) {
          this._incomingCallSound = new Sound('calling.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (!error) {
              this._incomingCallSound.setNumberOfLoops(-1);
              this._incomingCallSound.play();
            }
          });
        }
        break;
      case 'end':
        this._endCallSound = new Sound('end_call.mp3', Sound.MAIN_BUNDLE, (error) => {
          if (!error) {
            this._endCallSound.play(() => {
              this._endCallSound?.release();
              this._endCallSound = undefined;
            });
          }
        });
        break;

      default:
        break;
    }
  }

  stopSounds() {
    if (this._incomingCallSound?.isPlaying()) {
      this._incomingCallSound?.stop(() => {
        this._incomingCallSound?.release();
        this._incomingCallSound = undefined;
      });
    }
    if (this._outgoingCallSound?.isPlaying()) {
      this._outgoingCallSound?.stop(() => {
        this._outgoingCallSound?.release();
        this._outgoingCallSound = undefined;
      });
    }
  }

  async setMediaDevices() {
    this.mediaDevices = await ConnectyCube.videochat.getMediaDevices();
  }

  _onCallListener = async (session, extension) => {
    // if already on a call
    if (this.callSession && !this.isDummySession) {
      console.log('[CallService][_onCallListener] reject, already_on_call');
      session.reject({ already_on_call: true });
      return;
    }

    store.dispatch(setCallSession({ session, isIncoming: true }));

    console.log('[CallService][_onCallListener]', { isEarlyAccepted: this.isEarlyAccepted, isAccepted: this.isAccepted });

    if (this.isEarlyAccepted && !this.isAccepted) {
      setTimeout(() => {
        this.acceptCall();
      });
    }
  };

  _onAcceptCallListener = async (session, userId, extension) => {
    console.log('_onAcceptCallListener', userId);

    if (this.callSession) {
      this.stopSounds();
    }

    showToast(`${getUserById(userId, 'full_name')} has accepted the call`);
  };

  _onRejectCallListener = async (session, userId, extension) => {
    store.dispatch(removeStream({ userId }));

    const userName = getUserById(userId, 'full_name');
    const message = extension.already_on_call
      ? `${userName} is busy (already on a call)`
      : `${userName} rejected the call request`;

    showToast(message);
  };

  _onStopCallListener = async (session, userId, extension) => {
    this.stopSounds();

    const userName = getUserById(userId, 'full_name');
    const message = `${userName} has left the call`;

    showToast(message);

    store.dispatch(removeStream({ userId }));
    if (this.streams.length <= 1) {
      store.dispatch(resetActiveCall());
      CallKeepService.reportEndCallWithoutUserInitiating(session.ID, CK_CONSTANTS.END_CALL_REASONS.REMOTE_ENDED);
    }
  };

  _onUserNotAnswerListener = async (session, userId) => {
    showToast(`${getUserById(userId, 'full_name')} did not answer`);

    store.dispatch(removeStream({ userId }));
  };

  _onRemoteStreamListener = async (session, userId, stream) => {
    store.dispatch(upsertStreams([{ userId, stream }]));
  };
}

export default new CallService();
