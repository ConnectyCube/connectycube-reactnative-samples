import {Platform, ToastAndroid} from 'react-native';
import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import TrackPlayer from 'react-native-track-player';
import {users} from '../config';

export default class CallService {
  static MEDIA_OPTIONS = {audio: true, video: {facingMode: 'user'}};

  _session = null;
  mediaDevices = [];

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

  setMediaDevices() {
    return ConnectyCube.videochat.getMediaDevices().then(mediaDevices => {
      this.mediaDevices = mediaDevices;
    });
  }

  acceptCall = session => {
    this._session = session;
    this.setMediaDevices();
    this.resetRingtone();

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
    this.setMediaDevices();
    this.playRingtone('out');

    return this._session
      .getUserMedia(CallService.MEDIA_OPTIONS)
      .then(stream => {
        this._session.call({});
        return stream;
      });
  };

  stopCall = () => {
    if (this._session) {
      this.resetRingtone();
      this.playRingtone('end');
      this._session.stop({});
      ConnectyCube.videochat.clearSession(this._session.ID);
      this._session = null;
      this.mediaDevices = [];
    }
  };

  rejectCall = (session, extension) => {
    this.resetRingtone();
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
        const userName = this.getUserById(userId, 'name');
        const message = `${userName} did not answer`;

        this.showToast(message);

        resolve();
      }
    });
  }

  processOnCallListener(session) {
    return new Promise((resolve, reject) => {
      if (session.initiatorID === session.currentUserID) {
        reject();
      }

      if (this._session) {
        this.rejectCall(session, {busy: true});
        reject();
      }

      this.playRingtone('in');

      resolve();
    });
  }

  processOnAcceptCallListener(session, userId, extension = {}) {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        this.showToast('You have accepted the call on other side');

        reject();
      } else {
        const userName = this.getUserById(userId, 'name');
        const message = `${userName} has accepted the call`;

        this.showToast(message);
        this.resetRingtone();

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

  processOnStopCallListener(userId, isInitiator) {
    return new Promise((resolve, reject) => {
      if (!this._session) {
        reject();
      } else {
        const userName = this.getUserById(userId, 'name');
        const message = `${userName} has ${
          isInitiator ? 'stopped' : 'left'
        } the call`;

        this.showToast(message);
        this.resetRingtone();

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

  playRingtone = type => {
    const outgoingCall = new Array(20).fill({
      id: '1',
      url: require('../../assets/sounds/dialing.mp3'),
      title: 'Outgoing Call',
      artist: 'Unknown',
    });
    const incomingCall = new Array(20).fill({
      id: '2',
      url: require('../../assets/sounds/calling.mp3'),
      title: 'Incoming Call',
      artist: 'Unknown',
    });
    const endCall = {
      id: '3',
      url: require('../../assets/sounds/end_call.mp3'),
      title: 'End Call',
      artist: 'Unknown',
    };
    const tracks =
      type === 'out' ? outgoingCall : type === 'in' ? incomingCall : endCall;

    TrackPlayer.setupPlayer().then(async () => {
      await TrackPlayer.add(tracks);
      TrackPlayer.play();
    });
  };

  resetRingtone = () => {
    TrackPlayer.reset();
  };
}
