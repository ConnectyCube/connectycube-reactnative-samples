import React, { useState, useContext } from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import CallContext from '../../services/call-service';

const ToolBar = ({
  resetState,
  isActiveCall,
  isActiveSelect,
  selectedUsersIds,
  closeSelect,
  initRemoteStreams,
  localStream,
  setLocalStream,
}) => {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const CallService = useContext(CallContext);

  const isCallInProgress = isActiveCall || !isActiveSelect;
  const isAvailableToSwitch = isActiveCall && CallService.mediaDevices.current.length > 1;

  const startCall = async () => {
    if (selectedUsersIds.length === 0) {
      CallService.showToast('Select at less one user to start Videocall');
    } else {
      closeSelect();
      initRemoteStreams(selectedUsersIds);
      const result = await CallService.startCall(selectedUsersIds);
      setLocalStream(result);
    }
  };

  const stopCall = () => {
    CallService.stopCall();
    resetState();
  };

  const switchCamera = () => {
    CallService.switchCamera(localStream);
    setIsFrontCamera(!isFrontCamera);
  };

  const muteUnmuteAudio = () => {
    const mute = !isAudioMuted;
    CallService.setAudioMuteState(mute);
    return { isAudioMuted: mute };
  };

  const _renderCallStartStopButton = isCallInProgress => (
    <TouchableOpacity
      style={[
        styles.buttonContainer,
        isCallInProgress
          ? styles.buttonCallEnd
          : styles.buttonCall,
      ]}
      onPress={
        isCallInProgress
          ? stopCall
          : startCall
      }
    >
      <MaterialIcon
        name={
          isCallInProgress
            ? 'call-end'
            : 'call'
        }
        size={32}
        color="white"
      />
    </TouchableOpacity>
  );

  const _renderMuteButton = () => (
    <TouchableOpacity
      style={[styles.buttonContainer, styles.buttonMute]}
      onPress={muteUnmuteAudio}
    >
      <MaterialIcon
        name={
          isAudioMuted
            ? 'mic-off'
            : 'mic'
        }
        size={32}
        color="white"
      />
    </TouchableOpacity>
  );

  const _renderSwitchVideoSourceButton = () => (
    <TouchableOpacity
      style={[styles.buttonContainer, styles.buttonSwitch]}
      onPress={switchCamera}
    >
      <MaterialIcon
        name={
          isFrontCamera
            ? 'camera-rear'
            : 'camera-front'
        }
        size={32}
        color="white"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolBarItem}>
        {isActiveCall && _renderMuteButton()}
      </View>
      <View style={styles.toolBarItem}>
        {_renderCallStartStopButton(isCallInProgress)}
      </View>
      <View style={styles.toolBarItem}>
        {isAvailableToSwitch && _renderSwitchVideoSourceButton()}
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
  buttonContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCall: {
    backgroundColor: 'green',
  },
  buttonCallEnd: {
    backgroundColor: 'red',
  },
  buttonMute: {
    backgroundColor: 'blue',
  },
  buttonSwitch: {
    backgroundColor: 'orange',
  },
});
