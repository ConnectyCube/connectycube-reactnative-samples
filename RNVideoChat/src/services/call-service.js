import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import {Alert} from 'react-native';

export default class CallService {
  static MEDIA_OPTIONS = {audio: true, video: {facingMode: 'user'}};

  _session = null;
  mediaDevices = [];

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

  processOnUserNotAnswer(session, userId) {
    Alert.alert(
      'An opponent did not answer',
      '',
      [{text: 'Ok', onPress: () => {}}],
      {cancelable: true},
    );
  }

  processOnCallListener(session, extension) {
    return new Promise(resolve => {
      Alert.alert(
        'Incoming call',
        'from user',
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

  processOnAcceptCallListener(session, extension) {}

  processOnRejectCallListener(session, extension) {
    Alert.alert(
      'An opponent rejected the call request',
      '',
      [{text: 'Ok', onPress: () => {}}],
      {cancelable: true},
    );
  }

  processOnStopCallListener(session, extension) {
    Alert.alert('The call is finished', '', [{text: 'Ok', onPress: () => {}}], {
      cancelable: true,
    });
  }
}
