import {Platform, ToastAndroid} from 'react-native';
import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import {Alert} from 'react-native';
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

    return this._session
      .getUserMedia(CallService.MEDIA_OPTIONS)
      .then(stream => {
        this._session.call({});
        return stream;
      });
  };

  stopCall = () => {
    if (this._session) {
      this._session.stop({});
      ConnectyCube.videochat.clearSession(this._session.ID);
      this._session = null;
      this.mediaDevices = [];
    }
  };

  rejectCall = session => session.reject({});

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

  processOnUserNotAnswer(userId) {
    this.showToast(`${this.getUserById(userId, 'name')} did not answer`);
  }

  processOnCallListener(session) {
    return new Promise(resolve => {
      Alert.alert(
        'Incoming call',
        `from ${this.getUserById(session.initiatorID, 'name')}`,
        [
          {
            text: 'Accept',
            onPress: () => this.acceptCall(session).then(resolve),
          },
          {
            text: 'Reject',
            onPress: () => this.rejectCall(session),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    });
  }

  processOnRejectCallListener(userId) {
    this.showToast(
      `${this.getUserById(userId, 'name')} rejected the call request`,
    );
  }

  processOnStopCallListener(userId, isInitiator) {
    this.showToast(
      `${this.getUserById(userId, 'name')} has ${
        isInitiator ? 'stopped' : 'left'
      } the call`,
    );
  }
}
