import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, TouchableOpacity} from 'react-native';
import {CallService} from '../../services';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default class ToolBar extends Component {
  state = {isAudioMuted: false};

  startCall = () => {
    const {opponentsIds, setCalling, setLocalStream} = this.props;

    CallService.startCall(opponentsIds).then(stream => {
      setCalling();
      setLocalStream(stream);
    });
  };

  stopCall = () => {
    const {resetState} = this.props;

    CallService.stopCall();
    resetState();
  };

  switchCamera = () => {
    const {localStream} = this.props;

    CallService.switchCamera(localStream);
  };

  muteUnmuteAudio = () => {
    this.setState(prevState => {
      const mute = !prevState.isAudioMuted;
      CallService.setAudioMuteState(mute);
      return {isAudioMuted: mute};
    });
  };

  _renderCallStartStopButton = isCallInProgress => {
    const style = isCallInProgress ? styles.buttonCallEnd : styles.buttonCall;
    const onPress = isCallInProgress ? this.stopCall : this.startCall;
    const type = isCallInProgress ? 'call-end' : 'call';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, style]}
        onPress={onPress}>
        <MaterialIcon name={type} size={38} color="white" />
      </TouchableOpacity>
    );
  };

  _renderMuteButton = () => {
    const {isAudioMuted} = this.state;
    const type = isAudioMuted ? 'microphone-plus' : 'microphone-minus';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonMute]}
        onPress={this.muteUnmuteAudio}>
        <MaterialCommunityIcon name={type} size={38} color="white" />
      </TouchableOpacity>
    );
  };

  _renderSwitchVideoSourceButton = () => (
    <TouchableOpacity
      style={[styles.buttonContainer, styles.buttonSwitch]}
      onPress={this.switchCamera}>
      <MaterialCommunityIcon name="video-switch" size={38} color="white" />
    </TouchableOpacity>
  );

  render() {
    const {isCalling, isActiveCall} = this.props;
    const isCallInProgress = isActiveCall || isCalling;
    const isAvailableToSwitch =
      isActiveCall && CallService.mediaDevices.length > 1;

    return (
      <SafeAreaView style={styles.container}>
        {this._renderCallStartStopButton(isCallInProgress)}
        {isActiveCall && this._renderMuteButton()}
        {isAvailableToSwitch && this._renderSwitchVideoSourceButton()}
      </SafeAreaView>
    );
  }
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
  buttonContainer: {
    height: 60,
    width: 60,
    borderRadius: 30,
    marginHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCall: {
    backgroundColor: 'forestgreen',
  },
  buttonCallEnd: {
    backgroundColor: 'red',
  },
  buttonMute: {
    backgroundColor: 'mediumblue',
  },
  buttonSwitch: {
    backgroundColor: 'gold',
  },
});
