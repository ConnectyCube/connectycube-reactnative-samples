import { Platform, ToastAndroid } from 'react-native';
import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import { users } from '../config';

export default class CallService {
  participantIds = [];

  static MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };
  static CURRENT_USER = null;

  _session = null;
  mediaDevices = [];


  outgoingCall = new Sound(require('../../assets/sounds/dialing.mp3'));
  incomingCall = new Sound(require('../../assets/sounds/calling.mp3'));
  endCall = new Sound(require('../../assets/sounds/end_call.mp3'));


  startCall = (ids) => {
    const opponents = [];

    ids.forEach(id => {
      const userInfo = this.getUserById(id)
      opponents.push(userInfo.id, userInfo.name);
    })

    this.participantIds = ids
    this.janusRoomId = this._getUniqueRoomId()
    this.sendIncomingCallSystemMessage(ids)
    this.playSound('outgoing')
    this.initiatorID = this.currentUserID
    // this.startNoAnswerTimers(this.participantIds)
    return this.joinConf()
    // this.startNoAnswerTimers(this.participantIds)
  };

  stopCall = () => {
    console.warn('stopCall-method')
    this.stopSounds();

    if (!this.isGuestMode) {
      console.warn('stopCall', this.participantIds)
      this.sendEndCallMessage([...this.participantIds, this.initiatorID], this.janusRoomId)
    }

    if (this._session) {
      this._session.leave();
      this.playSound('end');
      ConnectyCube.videochatconference.clearSession(this._session.id);
      this.mediaDevices = [];
    }
  };

  acceptCall = () => {
    this.stopSounds();
    this.setMediaDevices();
    this._session = ConnectyCube.videochatconference.createNewSession()
    return this._session.getUserMedia(CallService.MEDIA_OPTIONS).then(stream => {
      this._session.join(this.janusRoomId, CallService.CURRENT_USER.id, CallService.CURRENT_USER.name);
      return stream;
    })
  };

  rejectCall = () => {
    this.stopSounds();
    const participantIds = [this.initiatorID, ...this.participantIds]
    this.sendRejectCallMessage(participantIds, this.janusRoomId, false)
    this.stopCall()
  };

  joinConf = (retry) => {
    this._session = ConnectyCube.videochatconference.createNewSession()
    return this._session.getUserMedia(CallService.MEDIA_OPTIONS).then(stream => {
      this._session.join(
        this.janusRoomId,
        CallService.CURRENT_USER.id,
        CallService.CURRENT_USER.name
      );
      return stream;
    }, error => {
      console.warn('[Get user media error]', error, this.mediaParam)
      if (!retry) {
        this.mediaParams.video = false
        return this.joinConf(this.janusRoomId, true)
      }
    });
  }

  onSystemMessage = (msg, showInomingCallModal, hideInomingCallModal) => {
    console.log('[onSystemMessage]', msg)
    const { extension, userId } = msg
    if (extension.callStart) {
      console.log('onSystemMessage{callStart}')
      const { participantIds, janusRoomId } = extension
      this.playSound('incoming');
      const oponentIds = participantIds
        .split(',')
        .map(user_id => +user_id)
        .filter(user_id => user_id != this.currentUserID)
      if (this.janusRoomId) {
        console.log('onSystemMessageRejectCallMessage}')
        return this.sendRejectCallMessage([...oponentIds, userId], janusRoomId, true)
      }
      this.janusRoomId = janusRoomId
      this.initiatorID = userId
      this.participantIds = oponentIds
      showInomingCallModal();
    } else if (extension.callRejected) {
      console.log('onSystemMessage{callRejected}')
      const { janusRoomId } = extension
      if (this.janusRoomId === janusRoomId) {
        const { busy } = extension
        this.processOnRejectCallListener(this._session, userId, { busy })
      }
    } else if (extension.callEnd) {
      const { janusRoomId } = extension
      if (this.janusRoomId === janusRoomId) {
        console.log('onSystemMessage{callEnd}')
        hideInomingCallModal();
        this.processOnStopCallListener(userId, this.initiatorID)
      }
    }
  }

  processOnRemoteStreamListener = () => {
    return new Promise((resolve, reject) => {
      if (!this._session) {
        reject();
      } else {
        resolve();
      }
    });
  };

  processOnStopCallListener(userId, isInitiator) {
    console.warn('processOnStopCallListener')
    return new Promise((resolve, reject) => {
      this.stopSounds();

      if (!this._session) {
        reject();
      } else {
        const userName = this.getUserById(userId, 'name');
        const message = `${userName} has ${
          isInitiator ? 'stopped' : 'left'
          } the call`;

        this.showToast(message);

        resolve();
      }
    });
  }

  processOnRejectCallListener(session, userId, extension = {}) {

    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        this.showToast('You have rejected the call on other side');

        reject();
      } else {
        const userName = this.getUserById(userId, 'name');
        const message = extension.busy
          ? `${userName} is busy`
          : `${userName} rejected the call request`;

        this.showToast(message);

        resolve();
      }
    });
  }

  sendIncomingCallSystemMessage = (participantIds) => {
    const msg = {
      extension: {
        callStart: '1',
        janusRoomId: this.janusRoomId,
        participantIds: participantIds.join(','),
      }
    }
    return participantIds.map(user_id => ConnectyCube.chat.sendSystemMessage(user_id, msg))
  }

  sendEndCallMessage = (participantIds, janusRoomId) => {
    const msg = {
      extension: {
        callEnd: '1',
        janusRoomId
      }
    }
    return participantIds.map(user_id => ConnectyCube.chat.sendSystemMessage(user_id, msg))
  }

  sendRejectCallMessage = (participantIds, janusRoomId, isBusy) => {
    const msg = {
      extension: {
        callRejected: '1',
        janusRoomId,
        busy: !!isBusy
      }
    }
    return participantIds.map(user_id => ConnectyCube.chat.sendSystemMessage(user_id, msg))
  }

  getUserById = (userId, key) => {
    const user = users.find(user => user.id == userId);
    if (typeof key === 'string') {
      return user[key];
    }
    return user;
  };

  showToast = text => {
    const commonToast = Platform.OS === 'android' ? ToastAndroid : Toast;
    commonToast.showWithGravity(text, Toast.LONG, Toast.TOP);
  };

  setMediaDevices() {
    return ConnectyCube.videochatconference.getMediaDevices().then(mediaDevices => {
      this.mediaDevices = mediaDevices;
    });
  };

  _getUniqueRoomId() {
    return ConnectyCube.chat.helpers.getBsonObjectId()
  };

  playSound = type => {
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
  };

  stopSounds = () => {
    if (this.incomingCall.isPlaying()) {
      this.incomingCall.pause();
    }
    if (this.outgoingCall.isPlaying()) {
      this.outgoingCall.pause();
    }
  };


  // setAudioMuteState = mute => {
  //   if (mute) {
  //     this._session.mute('audio');
  //   } else {
  //     this._session.unmute('audio');
  //   }
  // };

  // switchCamera = localStream => {
  //   localStream.getVideoTracks().forEach(track => track._switchCamera());
  // };

  // setSpeakerphoneOn = flag => InCallManager.setSpeakerphoneOn(flag);

  // processOnUserNotAnswerListener(userId) {
  //   return new Promise((resolve, reject) => {
  //     if (!this._session) {
  //       reject();
  //     } else {
  //       const userName = this.getUserById(userId, 'name');
  //       const message = `${userName} did not answer`;

  //       this.showToast(message);

  //       resolve();
  //     }
  //   });
  // }

}
