import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Aperture, CircleUser, Mic, MicOff, PhoneOff } from 'lucide-react-native';
import { useSelector } from 'react-redux';

export default function VideoToolBar({ displaySwitchCam, onSwitchCamera, onStopCall, onMute, canSwitchCamera }) {
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const isMicrophoneMuted = useSelector(store => store.activeCall.isMicrophoneMuted);

  function switchCamera() {
    onSwitchCamera();
    setIsFrontCamera(!isFrontCamera);
  }

  function muteUnmuteAudio() {
    onMute(!isMicrophoneMuted);
  }

  function _renderStopButton() {
    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonCallEnd]}
        onPress={onStopCall}>
        <PhoneOff size={32} color="white" />
      </TouchableOpacity>
    );
  }

  function _renderMuteButton() {
    const MicIcon = isMicrophoneMuted ? MicOff : Mic;

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonMute]}
        onPress={muteUnmuteAudio}>
        <MicIcon size={32} color="white" />
      </TouchableOpacity>
    );
  }

  function _renderSwitchVideoSourceButton() {
    const CameraIcon = isFrontCamera ? Aperture : CircleUser;

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonSwitch]}
        onPress={switchCamera}>
        <CameraIcon size={32} color="white" />
      </TouchableOpacity>
    );
  }

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
