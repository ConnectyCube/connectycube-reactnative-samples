import { Platform, ToastAndroid } from 'react-native';
import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import { users } from '../config';

export default class CallService {
  participantIds = [];

  static MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };

  _session = null;
  // mediaDevices = [];

  outgoingCall = new Sound(require('../../assets/sounds/dialing.mp3'));
  incomingCall = new Sound(require('../../assets/sounds/calling.mp3'));
  endCall = new Sound(require('../../assets/sounds/end_call.mp3'));

  showToast = text => {
    const commonToast = Platform.OS === 'android' ? ToastAndroid : Toast;

    commonToast.showWithGravity(text, Toast.LONG, Toast.TOP);
  };

  getUserById = (userId, key) => {
    const user = users.find(user => user.id == userId);

    if (typeof key === 'string') {
      return user[key];
    }

    return user;
  };

  // setMediaDevices() {
  //   return ConnectyCube.videochat.getMediaDevices().then(mediaDevices => {
  //     this.mediaDevices = mediaDevices;
  //   });
  // }

  // acceptCall = session => {
  //   this.stopSounds();
  //   this._session = session;
  //   this.setMediaDevices();

  //   return this._session
  //     .getUserMedia(CallService.MEDIA_OPTIONS)
  //     .then(stream => {
  //       this._session.accept({});
  //       return stream;
  //     });
  // };

  // startCall = ids => {
  //   const options = {};
  //   const type = ConnectyCube.videochat.CallType.VIDEO; // AUDIO is also possible

  //   this._session = ConnectyCube.videochat.createNewSession(ids, type, options);
  //   this.setMediaDevices();
  //   this.playSound('outgoing');

  //   return this._session
  //     .getUserMedia(CallService.MEDIA_OPTIONS)
  //     .then(stream => {
  //       this._session.call({});
  //       return stream;
  //     });
  // };

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
    this.joinConf(this.janusRoomId)

    // this.startNoAnswerTimers(this.participantIds)
    // this.joinConf(this.janusRoomId)


    // return this._session
    //     .getUserMedia(CallService.MEDIA_OPTIONS)
    //     .then(stream => {
    //       this._session.call({});
    //       return stream;
    //     });

  };

  // startCall = ids => {
  //   const options = {};
  //   const type = ConnectyCube.videochat.CallType.VIDEO; // AUDIO is also possible

  //   this._session = ConnectyCube.videochat.createNewSession(ids, type, options);
  //   this.setMediaDevices();
  //   this.playSound('outgoing');

  //   return this._session
  //     .getUserMedia(CallService.MEDIA_OPTIONS)
  //     .then(stream => {
  //       this._session.call({});
  //       return stream;
  //     });
  // };

  joinConf = (janusRoomId, retry) => {
    this._session = ConnectyCube.videochatconference.createNewSession()
    console.warn('this._session', this._session)

    // return this._session.getUserMedia(CallService.MEDIA_OPTIONS).then(stream => {
    //   this._session.call({});
    //   return stream;
    //   // this.addStreamElement({ id: this.currentUserID, name: 'Me', local: true })
    //   // this.removeStreamLoaderByUserId(this.currentUserID)
    //   // this._session.attachMediaStream(this.getStreamIdByUserId(this.currentUserID), stream, { muted: true });
    //   // this._prepareVideoElement(this.currentUserID, this.mediaParams.video);
    //   // this.toggelStreamMirror(this.currentUserID)
    //   // return this._session.join(janusRoomId, this.currentUserID, this.currentUserName).then(() => this.postJoinActions())
    // }, error => {
    //   console.warn('[Get user media error]', error, this.mediaParam)
    //   if (!retry) {
    //     this.mediaParams.video = false
    //     return this.joinConf(janusRoomId, true)
    //   }
    // });
  }

  _getUniqueRoomId() {
    return ConnectyCube.chat.helpers.getBsonObjectId()
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

  // stopCall = () => {
  //   this.stopSounds();

  //   if (this._session) {
  //     this.playSound('end');
  //     this._session.stop({});
  //     ConnectyCube.videochat.clearSession(this._session.ID);
  //     this._session = null;
  //     this.mediaDevices = [];
  //   }
  // };

  // rejectCall = (session, extension) => {
  //   this.stopSounds();
  //   session.reject(extension);
  // };

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

  // processOnCallListener(session) {
  //   return new Promise((resolve, reject) => {
  //     if (session.initiatorID === session.currentUserID) {
  //       reject();
  //     }

  //     if (this._session) {
  //       this.rejectCall(session, {busy: true});
  //       reject();
  //     }

  //     this.playSound('incoming');

  //     resolve();
  //   });
  // }

  // processOnAcceptCallListener(session, userId, extension = {}) {
  //   return new Promise((resolve, reject) => {
  //     if (userId === session.currentUserID) {
  //       this._session = null;
  //       this.showToast('You have accepted the call on other side');

  //       reject();
  //     } else {
  //       const userName = this.getUserById(userId, 'name');
  //       const message = `${userName} has accepted the call`;

  //       this.showToast(message);
  //       this.stopSounds();

  //       resolve();
  //     }
  //   });
  // }

  // processOnRejectCallListener(session, userId, extension = {}) {
  //   return new Promise((resolve, reject) => {
  //     if (userId === session.currentUserID) {
  //       this._session = null;
  //       this.showToast('You have rejected the call on other side');

  //       reject();
  //     } else {
  //       const userName = this.getUserById(userId, 'name');
  //       const message = extension.busy
  //         ? `${userName} is busy`
  //         : `${userName} rejected the call request`;

  //       this.showToast(message);

  //       resolve();
  //     }
  //   });
  // }

  // processOnStopCallListener(userId, isInitiator) {
  //   return new Promise((resolve, reject) => {
  //     this.stopSounds();

  //     if (!this._session) {
  //       reject();
  //     } else {
  //       const userName = this.getUserById(userId, 'name');
  //       const message = `${userName} has ${
  //         isInitiator ? 'stopped' : 'left'
  //       } the call`;

  //       this.showToast(message);

  //       resolve();
  //     }
  //   });
  // }

  // processOnRemoteStreamListener = () => {
  //   return new Promise((resolve, reject) => {
  //     if (!this._session) {
  //       reject();
  //     } else {
  //       resolve();
  //     }
  //   });
  // };

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

  // stopSounds = () => {
  //   if (this.incomingCall.isPlaying()) {
  //     this.incomingCall.pause();
  //   }
  //   if (this.outgoingCall.isPlaying()) {
  //     this.outgoingCall.pause();
  //   }
  // };
}
