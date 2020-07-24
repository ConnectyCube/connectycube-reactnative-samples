import React, { useRef } from 'react';
import { Platform, ToastAndroid } from 'react-native';
import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import { users } from '../config';

const CallContext = React.createContext();

export default CallContext;

const CallProvider = ({ children }) => {
  const _session = useRef(null);
  const mediaDevices = useRef([]);

  const outgoingCall = useRef(new Sound(require('../../assets/sounds/dialing.mp3')));
  const incomingCall = useRef(new Sound(require('../../assets/sounds/calling.mp3')));
  const endCall = useRef(new Sound(require('../../assets/sounds/end_call.mp3')));

  const showToast = text => {
    const commonToast = Platform.OS === 'android' ? ToastAndroid : Toast;
    commonToast.showWithGravity(text, Toast.LONG, Toast.TOP);
  };

  const getUserById = (userId, key) => {
    const user = users.find(user => user.id == userId);

    if (typeof key === 'string') {
      return user[key];
    }

    return user;
  };

  const setMediaDevices = async () => {
    const mediaDevicesResult = await ConnectyCube.videochat.getMediaDevices();
    mediaDevices.current = mediaDevicesResult;
  };

  const acceptCall = async (session) => {
    stopSounds();
    _session.current = session;
    await setMediaDevices();

    const stream = await _session.current.getUserMedia(CallProvider.MEDIA_OPTIONS);
    _session.current.accept({});
    return stream;
  };

  const startCall = async (ids) => {
    const options = {};
    const type = ConnectyCube.videochat.CallType.VIDEO; // AUDIO is also possible

    _session.current = ConnectyCube.videochat.createNewSession(ids, type, options);
    setMediaDevices();
    playSound('outgoing');

    const stream = await _session.current.getUserMedia(CallProvider.MEDIA_OPTIONS);
    _session.current.call({});
    return stream;
  };

  const stopCall = () => {
    stopSounds();

    if (_session.current) {
      playSound('end');
      _session.current.stop({});
      ConnectyCube.videochat.clearSession(_session.current.ID);
      _session.current = null;
      mediaDevices.current = [];
    }
  };

  const rejectCall = (session, extension) => {
    stopSounds();
    session.reject(extension);
  };

  const setAudioMuteState = mute => {
    if (mute) {
      _session.current.mute('audio');
    } else {
      _session.current.unmute('audio');
    }
  };

  const switchCamera = localStream =>
    localStream.getVideoTracks()
      .forEach(track => track._switchCamera());

  const setSpeakerphoneOn = flag =>
    InCallManager.setSpeakerphoneOn(flag);

  const processOnUserNotAnswerListener = async (userId) =>
    new Promise((resolve, reject) => {
      if (!_session.current) {
        reject();
      } else {
        const userName = getUserById(userId, 'name');
        const message = `${userName} did not answer`;

        showToast(message);
        resolve();
      }
    });

  const processOnCallListener = async (session) =>
    new Promise((resolve, reject) => {
      if (session.initiatorID === session.currentUserID) {
        reject();
      }

      if (_session.current) {
        rejectCall(session, { busy: true });
        reject();
      }

      playSound('incoming');
      resolve();
    });

  const processOnAcceptCallListener = async (session, userId, extension = {}) =>
    new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        _session.current = null;

        showToast('You have accepted the call on other side');
        reject();
      } else {
        const userName = getUserById(userId, 'name');
        const message = `${userName} has accepted the call`;

        showToast(message);
        stopSounds();
        resolve();
      }
    });

  const processOnRejectCallListener = async (session, userId, extension = {}) =>
    new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        _session.current = null;

        showToast('You have rejected the call on other side');
        reject();
      } else {
        const userName = getUserById(userId, 'name');
        const message = extension.busy
          ? `${userName} is busy`
          : `${userName} rejected the call request`;

        showToast(message);
        resolve();
      }
    });

  const processOnStopCallListener = async (userId, isInitiator) =>
    new Promise((resolve, reject) => {
      stopSounds();

      if (!_session.current) {
        reject();
      } else {
        const userName = getUserById(userId, 'name');
        const message = `${userName} has ${
          isInitiator
            ? 'stopped'
            : 'left'
        } the call`;

        showToast(message);
        resolve();
      }
    });

  const processOnRemoteStreamListener = async () =>
    new Promise((resolve, reject) => {
      if (!_session.current) {
        reject();
      } else {
        resolve();
      }
    });

  const playSound = type => {
    switch (type) {
    case 'outgoing':
      outgoingCall.current.setNumberOfLoops(-1);
      outgoingCall.current.play();
      break;
    case 'incoming':
      incomingCall.current.setNumberOfLoops(-1);
      incomingCall.current.play();
      break;
    case 'end':
      endCall.current.play();
      break;
    default:
      break;
    }
  };

  const stopSounds = () => {
    if (incomingCall.current.isPlaying()) {
      incomingCall.current.pause();
    }
    if (outgoingCall.current.isPlaying()) {
      outgoingCall.current.pause();
    }
  };

  return (
    <CallContext.Provider
      value={{
        showToast,
        getUserById,
        setMediaDevices,
        acceptCall,
        startCall,
        stopCall,
        rejectCall,
        setAudioMuteState,
        switchCamera,
        setSpeakerphoneOn,
        processOnUserNotAnswerListener,
        processOnCallListener,
        processOnAcceptCallListener,
        processOnRejectCallListener,
        processOnStopCallListener,
        processOnRemoteStreamListener,
        playSound,
        stopSounds,
        mediaDevices,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

CallProvider.MEDIA_OPTIONS = { audio: true, video: { facingMode: 'user' } };

export { CallProvider };
