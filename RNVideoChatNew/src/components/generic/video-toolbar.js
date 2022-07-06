import React, {useState} from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import { CallService } from '../../services';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function VideoToolBar({switchCamera, stopCall}) {

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const canSwitchCamera = CallService.mediaDevices.length > 1;

  function switchCamera() {
    switchCamera();
    
    setIsFrontCamera(!isFrontCamera)
  };

  function muteUnmuteAudio() {
    CallService.muteMicrophone(!isAudioMuted);
    setIsAudioMuted(!isAudioMuted)
  };

  function _renderStopButton() {
    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonCallEnd]}
        onPress={stopCall}>
        <MaterialIcon name={'call-end'} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  function _renderMuteButton() {
    const type = isAudioMuted ? 'mic-off' : 'mic';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonMute]}
        onPress={muteUnmuteAudio}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  function _renderSwitchVideoSourceButton() {
    const type = isFrontCamera ? 'camera-rear' : 'camera-front';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonSwitch]}
        onPress={switchCamera}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.toolBarItem}>
        {_renderMuteButton()}
      </View>
      <View style={styles.toolBarItem}>
        {_renderStopButton()}
      </View>
      <View style={styles.toolBarItem}>
        {canSwitchCamera && _renderSwitchVideoSourceButton()}
      </View>
    </SafeAreaView>
  );
}

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
