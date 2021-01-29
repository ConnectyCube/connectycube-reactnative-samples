import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';

export default class CallService {
  static MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };

  _session = null;
  mediaDevices = [];

  _outgoingCallSound = null
  _incomingCallSound = null
  _endCallSound = null

  init(outgoingCallSound, incomingCallSound, endCallSound) {
    this._outgoingCallSound = new Sound(outgoingCallSound)
    this._incomingCallSound = new Sound(incomingCallSound)
    this._endCallSound = new Sound(endCallSound)
  }

  _retrieveAndSetAvailableMediaDevices() {
    return ConnectyCube.videochat.getMediaDevices().then(mediaDevices => {
      this.mediaDevices = mediaDevices;
    });
  }

  acceptCall = session => {
    this.stopSounds();
    this._session = session;
    this._retrieveAndSetAvailableMediaDevices();

    return this._session
      .getUserMedia(CallService.MEDIA_OPTIONS)
      .then(stream => {
        this._session.accept({});
        return stream;
      });
  };

  startCall = ids => {
    const options = {};
    const type = ConnectyCube.videochat.CallType.VIDEO; // AUDIO is also possible

    this._session = ConnectyCube.videochat.createNewSession(ids, type, options);
    this._retrieveAndSetAvailableMediaDevices();
    this.playSound('outgoing');

    return this._session
      .getUserMedia(CallService.MEDIA_OPTIONS)
      .then(stream => {
        this._session.call({});
        return stream;
      });
  };

  stopCall = () => {
    this.stopSounds();

    if (this._session) {
      this.playSound('end');
      this._session.stop({});
      ConnectyCube.videochat.clearSession(this._session.ID);
      this._session = null;
      this.mediaDevices = [];
    }
  };

  rejectCall = (session, extension) => {
    this.stopSounds();
    session.reject(extension);
  };

  setAudioMuteState = mute => {
    if (mute) {
      this._session.mute('audio');
    } else {
      this._session.unmute('audio');
    }
  };

  switchCamera = localStream => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  };

  setSpeakerphoneOn = flag => InCallManager.setSpeakerphoneOn(flag);

  processOnUserNotAnswerListener(userId) {
    return new Promise((resolve, reject) => {
      if (!this._session) {
        reject();
      } else {
        resolve();
      }
    });
  }

  processOnCallListener(session) {
    return new Promise((resolve, reject) => {
      if (session.initiatorID === session.currentUserID) {
        reject();
        return;
      }

      if (this._session) {
        this.rejectCall(session, { busy: true });
        reject();
        return;
      }

      this.playSound('incoming');

      resolve();
    });
  }

  processOnAcceptCallListener(session, userId, extension = {}) {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        reject();
      } else {
        this.stopSounds();
        resolve();
      }
    });
  }

  processOnRejectCallListener(session, userId, extension = {}) {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        reject();
      } else {
        resolve();
      }
    });
  }

  processOnStopCallListener() {
    return new Promise((resolve, reject) => {
      this.stopSounds();
      if (!this._session) {
        reject();
      } else {
        resolve();
      }
    });
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

  playSound = type => {
    switch (type) {
      case 'outgoing':
        this._outgoingCallSound.setNumberOfLoops(-1);
        this._outgoingCallSound.play();
        break;
      case 'incoming':
        this._incomingCallSound.setNumberOfLoops(-1);
        this._incomingCallSound.play();
        break;
      case 'end':
        this._endCallSound.play();
        break;

      default:
        break;
    }
  };

  stopSounds = () => {
    if (this._incomingCallSound.isPlaying()) {
      this._incomingCallSound.pause();
    }
    if (this._outgoingCallSound.isPlaying()) {
      this._outgoingCallSound.pause();
    }
  };
}
