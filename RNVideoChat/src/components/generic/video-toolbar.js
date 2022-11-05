import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, TouchableOpacity, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux'

export default function VideoToolBar({displaySwitchCam, onSwitchCamera, onStopCall, onMute, canSwitchCamera}) {
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const isMicrophoneMuted = useSelector(store => store.activeCall.isMicrophoneMuted);

  function switchCamera() {
    onSwitchCamera();
    
    setIsFrontCamera(!isFrontCamera)
  };

  function muteUnmuteAudio() {
    onMute(!isMicrophoneMuted)
  };

  function _renderStopButton() {
    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonCallEnd]}
        onPress={onStopCall}>
        <MaterialIcon name={'call-end'} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  function _renderMuteButton() {
    const type = isMicrophoneMuted ? 'mic-off' : 'mic';

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
      {displaySwitchCam && canSwitchCamera && 
        <View style={styles.toolBarItem}>
          {_renderSwitchVideoSourceButton()}
        </View>
      }
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
