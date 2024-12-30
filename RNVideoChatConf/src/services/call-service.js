import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import { users, NO_ANSWER_TIMER } from '../config';
import customEventEmitter, { CUSTOM_EVENTS } from './customEvents';

export default class CallService {
  static MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };
  static CURRENT_USER = null;

  _session = null;
  mediaDevices = [];
  _answerUserTimers = {};
  participantIds = [];

  outgoingCall = new Sound(require('../../assets/sounds/dialing.mp3'));
  incomingCall = new Sound(require('../../assets/sounds/calling.mp3'));
  endCall = new Sound(require('../../assets/sounds/end_call.mp3'));

  get hasSession() {
    return !!this._session;
  }

  getUserMedia(params = CallService.MEDIA_OPTIONS) {
    if (this.hasSession) {
      return this._session.getUserMedia(params);
    }
  }

  getDisplayMedia(params = {}) {
    if (this.hasSession) {
      return this._session.getDisplayMedia(params);
    }
  }

  onSystemMessage(msg, showIncomingCallModal, hideIncomingCallModal) {
    const { extension, userId } = msg;
    if (extension.callStart) {
      const { participantIds, janusRoomId } = extension;
      let opponentIds = participantIds.split(',').map((user_id) => +user_id);
      opponentIds.push(+userId);

      opponentIds = opponentIds.filter(
        (user_id) => user_id !== CallService.CURRENT_USER.id,
      );
      if (this.janusRoomId) {
        return this.sendRejectCallMessage(
          [...opponentIds, userId],
          janusRoomId,
          true,
        );
      }

      this.participantIds = opponentIds;
      this.janusRoomId = janusRoomId;
      this.initiatorID = userId;
      showIncomingCallModal();
    } else if (extension.callRejected) {
      const { janusRoomId } = extension;
      if (this.janusRoomId === janusRoomId) {
        const { busy } = extension;
        this.processOnRejectCallListener(this._session, userId, { busy });
      }
    } else if (extension.callEnd) {
      const { janusRoomId } = extension;
      if (this.janusRoomId === janusRoomId) {
        hideIncomingCallModal();
        this.processOnStopCallListener(userId, this.initiatorID);
      }
    }
  }

  joinConf(retry) {
    this._session = ConnectyCube.videochatconference.createNewSession();
    return this.getUserMedia().then(
      (stream) => {
        this._session.join(
          this.janusRoomId,
          CallService.CURRENT_USER.id,
          CallService.CURRENT_USER.full_name,
        );

        return stream;
      },
      (error) => {
        console.log('[Get user media error]', error, this.mediaParam);
        if (!retry) {
          this.mediaParams.video = false;
          return this.joinConf(this.janusRoomId, true);
        }
      },
    );
  }

  startCall(ids) {
    const opponents = [];

    ids.forEach((id) => {
      const userInfo = this.getUserById(id);
      opponents.push(userInfo.id, userInfo.full_name);
    });

    this.participantIds = ids;
    this.janusRoomId = this._getUniqueRoomId();
    this.sendIncomingCallSystemMessage(ids);
    this.playSound('outgoing');
    this.initiatorID = this.currentUserID;
    this.startNoAnswerTimers(this.participantIds);
    this.setMediaDevices();
    return this.joinConf();
  }

  stopCall() {
    this.stopSounds();

    if (!this.isGuestMode) {
      this.sendEndCallMessage(
        [...this.participantIds, this.initiatorID],
        this.janusRoomId,
      );
    }

    if (this.hasSession) {
      this._session.leave();
      this.playSound('end');
      ConnectyCube.videochatconference.clearSession(this._session.id);
      this.mediaDevices = [];
      customEventEmitter.emit(CUSTOM_EVENTS.STOP_CALL_UI_RESET);
    }

    this.clearNoAnswerTimers();
    this._session = null;
    this.videoDevicesIds = [];
    this.initiatorID = 0;
    this.participantIds = [];
    this.janusRoomId = 0;
    this.currentUserName = 0;
    this.isGuestMode = 0;
  }

  acceptCall() {
    this.stopSounds();
    this.setMediaDevices();
    this._session = ConnectyCube.videochatconference.createNewSession();
    // this.clearNoAnswerTimers(userId)
    return this.getUserMedia().then((stream) => {
      this._session.join(
        this.janusRoomId,
        CallService.CURRENT_USER.id,
        CallService.CURRENT_USER.full_name,
      );
      return stream;
    });
  }

  rejectCall() {
    this.stopSounds();
    const participantIds = [this.initiatorID, ...this.participantIds];
    this.sendRejectCallMessage(participantIds, this.janusRoomId, false);
    this.stopCall();
  }

  processOnStopCallListener(userId, isInitiator) {
    this.stopSounds();

    if (this.hasSession) {
      const userName = this.getUserById(userId, 'full_name');
      const action = isInitiator ? 'stopped' : 'left';
      const message = `${userName} has ${action} the call`;

      this.showToast(message);
    } else {
      throw new Error('No session');
    }
  }

  processOnRejectCallListener(session, userId, extension = {}) {
    if (userId === session.currentUserID) {
      this._session = null;
      this.showToast('You have rejected the call on other side');
    } else {
      const userName = this.getUserById(userId, 'full_name');
      const message = extension.busy
        ? `${userName} is busy`
        : `${userName} rejected the call request`;

      this.showToast(message);
    }
  }

  processOnAcceptCallListener(session, userId, displayName) {
    this.stopSounds();

    const userName = this.isGuestMode
      ? displayName
      : this.getUserById(userId, 'full_name');
    const action = this.isGuestMode ? 'joined' : 'accepted';
    const infoText = `${userName} has ${action} the call`;

    this.showToast(infoText);
    this.clearNoAnswerTimers(userId);
  }

  sendIncomingCallSystemMessage(participantIds) {
    const msg = {
      extension: {
        callStart: '1',
        janusRoomId: this.janusRoomId,
        participantIds: participantIds.join(','),
      },
    };
    return participantIds.map((user_id) =>
      ConnectyCube.chat.sendSystemMessage(user_id, msg),
    );
  }

  sendEndCallMessage(participantIds, janusRoomId) {
    const msg = {
      extension: {
        callEnd: '1',
        janusRoomId,
      },
    };
    return participantIds.map((user_id) =>
      ConnectyCube.chat.sendSystemMessage(user_id, msg),
    );
  }

  sendRejectCallMessage(participantIds, janusRoomId, isBusy) {
    const msg = {
      extension: {
        callRejected: '1',
        janusRoomId,
        busy: !!isBusy,
      },
    };
    return participantIds.map((user_id) =>
      ConnectyCube.chat.sendSystemMessage(user_id, msg),
    );
  }

  getUserById(userId, key) {
    const user = users.find((user) => user.id == userId);
    if (typeof key === 'string') {
      return user[key];
    }
    return user;
  }

  getParticipantIds() {
    return this.participantIds;
  }

  getInitiatorName() {
    const user = users.find((user) => user.id == this.initiatorID);
    return user.full_name;
  }

  showToast(text) {
    Toast.showWithGravity(text, Toast.LONG, Toast.TOP);
  }

  setMediaDevices() {
    return ConnectyCube.videochatconference
      .getMediaDevices()
      .then((mediaDevices) => {
        this.mediaDevices = mediaDevices;
      });
  }

  _getUniqueRoomId() {
    return ConnectyCube.chat.helpers.getBsonObjectId();
  }

  playSound(type) {
    switch (type) {
      case 'outgoing':
        this.outgoingCall.setNumberOfLoops(-1);
        this.outgoingCall.play();
        break;
      case 'incoming':
        this.incomingCall.setNumberOfLoops(-1);
        this.incomingCall.play();
        break;
      case 'end':
        this.endCall.play();
        break;

      default:
        break;
    }
  }

  stopSounds() {
    if (this.incomingCall.isPlaying()) {
      this.incomingCall.pause();
    }
    if (this.outgoingCall.isPlaying()) {
      this.outgoingCall.pause();
    }
  }

  isAudioMuted() {
    return this._session?.isAudioMuted();
  }

  isVideoMuted() {
    return this._session?.isVideoMuted();
  }

  setAudioMute() {
    const isAudioMuted = this.isAudioMuted();

    if (isAudioMuted) {
      this._session.unmuteAudio();
    } else {
      this._session.muteAudio();
    }

    return !isAudioMuted;
  }

  setVideoMute() {
    const isVideoMuted = this.isVideoMuted();

    if (isVideoMuted) {
      this._session.unmuteVideo();
    } else {
      this._session.muteVideo();
    }

    return !isVideoMuted;
  }

  setSpeakerphoneOn(flag) {
    InCallManager.setSpeakerphoneOn(flag);
  }

  switchCamera(localStream) {
    localStream.getVideoTracks().forEach((track) => track._switchCamera());
  }

  startNoAnswerTimers(participantIds) {
    participantIds.forEach((user_id) => {
      this._answerUserTimers[user_id] = setTimeout(
        () => this.onUserNotAnswerListener(user_id),
        NO_ANSWER_TIMER,
      );
    });
  }

  clearNoAnswerTimers(user_id) {
    if (user_id) {
      clearTimeout(this._answerUserTimers[user_id]);
      return delete this._answerUserTimers[user_id];
    }
    Object.values(this._answerUserTimers).forEach((timerId) =>
      clearTimeout(timerId),
    );
    this._answerUserTimers = {};
  }

  onUserNotAnswerListener(userId) {
    if (!this.hasSession) {
      return false;
    }

    const userName = this.getUserById(userId, 'full_name');
    const infoText = `${userName} did not answer`;

    this.showToast(infoText);
    this.sendEndCallMessage([userId], this.janusRoomId);
    this.stopCall(userId);
  }
}
