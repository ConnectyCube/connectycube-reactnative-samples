import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CallService from '../../services/call-service';
import { Aperture, CircleUser, Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react-native';
import customEventEmitter, { CUSTOM_EVENTS } from '../../services/customEvents';
import ShareScreenButton from './ShareScreenButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const ToolBar = ({
  selectedUsersIds,
  localStream,
  isActiveSelect,
  isActiveCall,
  closeSelect,
  initRemoteStreams,
  setLocalStream,
  resetState,
}) => {
  const [isAudioMuted, setIsAudioMuted] = React.useState(false);
  const [isVideoMuted, setIsVideoMuted] = React.useState(false);
  const [isFrontCamera, setIsFrontCamera] = React.useState(true);
  const [isSharedScreen, setIsSharedScreen] = React.useState(false);
  const isCallInProgress = isActiveCall || !isActiveSelect;
  const isAvailableToSwitch =
    isActiveCall && CallService.mediaDevices.length > 1 && !isVideoMuted;

  React.useEffect(() => {
    customEventEmitter.addListener(
      CUSTOM_EVENTS.STOP_CALL_UI_RESET,
      resetState,
    );

    return () => {
      customEventEmitter.removeListener(
        CUSTOM_EVENTS.STOP_CALL_UI_RESET,
        resetState,
      );
    };
  }, []);

  React.useEffect(() => {
    if (isActiveCall) {
      setIsAudioMuted(CallService.isAudioMuted());
      setIsVideoMuted(CallService.isVideoMuted());
    } else {
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      setIsFrontCamera(true);
    }
  }, [isActiveCall]);

  const startCall = React.useCallback(() => {
    if (selectedUsersIds.length === 0) {
      CallService.showToast('Select at less one user');
    } else {
      closeSelect();
      initRemoteStreams(selectedUsersIds);
      CallService.startCall(selectedUsersIds).then(setLocalStream);
    }
  }, [selectedUsersIds, closeSelect, initRemoteStreams, setLocalStream]);

  const stopCall = React.useCallback(() => {
    CallService.stopCall();
    resetState();
  }, [resetState]);

  const switchCamera = React.useCallback(() => {
    CallService.switchCamera(localStream);
    setIsFrontCamera((prevIsFrontCamera) => !prevIsFrontCamera);
  }, [localStream]);

  const muteUnmuteAudio = React.useCallback(() => {
    setIsAudioMuted(CallService.setAudioMute());
  }, []);

  const muteUnmuteVideo = React.useCallback(() => {
    setIsVideoMuted(CallService.setVideoMute());
  }, []);

  const CallStartStopButton = React.useCallback(() => {
    const style = isCallInProgress ? styles.buttonCallEnd : styles.buttonCall;
    const CallIcon = isCallInProgress ? PhoneOff : Phone;

    return (
      <TouchableOpacity
        style={[styles.buttonContainer(), style]}
        onPress={isCallInProgress ? stopCall : startCall}>
        <CallIcon size={32} color="white" />
      </TouchableOpacity>
    );
  }, [startCall, stopCall, isCallInProgress]);

  const MuteMicButton = React.useCallback(
    ({ visible }) => {
      const MicIcon = isAudioMuted ? MicOff : Mic;

      return visible ? (
        <TouchableOpacity
          style={[styles.buttonContainer(), styles.buttonMuteMic]}
          onPress={muteUnmuteAudio}>
          <MicIcon size={32} color="white" />
        </TouchableOpacity>
      ) : null;
    },
    [muteUnmuteAudio, isAudioMuted],
  );

  const MuteCamButton = React.useCallback(
    ({ visible }) => {
      const VideoIcon = isVideoMuted ? VideoOff : Video;

      return visible ? (
        <TouchableOpacity
          disabled={isSharedScreen}
          style={[styles.buttonContainer(isSharedScreen), styles.buttonMuteCam]}
          onPress={muteUnmuteVideo}>
          <VideoIcon size={32} color="white" />
        </TouchableOpacity>
      ) : null;
    },
    [muteUnmuteVideo, isVideoMuted, isSharedScreen],
  );

  const SwitchVideoSourceButton = React.useCallback(
    ({ visible }) => {
      const CameraIcon = isFrontCamera ? Aperture : CircleUser;

      return visible ? (
        <TouchableOpacity
          disabled={isSharedScreen}
          style={[styles.buttonContainer(isSharedScreen), styles.buttonSwitch]}
          onPress={switchCamera}>
          <CameraIcon size={32} color="white" />
        </TouchableOpacity>
      ) : null;
    },
    [switchCamera, isFrontCamera, isSharedScreen],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolBarItem}>
        <MuteMicButton visible={isActiveCall} />
      </View>
      <View style={styles.toolBarItem}>
        <MuteCamButton visible={isActiveCall} />
      </View>
      <View style={styles.toolBarItem}>
        <CallStartStopButton />
      </View>
      <View style={styles.toolBarItem}>
        <ShareScreenButton
          visible={isActiveCall}
          isSharedScreen={isSharedScreen}
          setIsSharedScreen={setIsSharedScreen}
          setLocalStream={setLocalStream}
        />
      </View>
      <View style={styles.toolBarItem}>
        <SwitchVideoSourceButton visible={isAvailableToSwitch} />
      </View>
    </SafeAreaView>
  );
};

export default ToolBar;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    height: 60,
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    zIndex: 100,
  },
  toolBarItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: (disabled) => ({
    height: 50,
    width: 50,
    borderRadius: 25,
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: disabled ? 0.7 : 1,
  }),
  buttonCall: {
    backgroundColor: 'green',
  },
  buttonCallEnd: {
    backgroundColor: 'red',
  },
  buttonMuteMic: {
    backgroundColor: 'blue',
  },
  buttonMuteCam: {
    backgroundColor: 'green',
  },
  buttonShareScreen: {
    backgroundColor: 'purple',
  },
  buttonSwitch: {
    backgroundColor: 'orange',
  },
});
