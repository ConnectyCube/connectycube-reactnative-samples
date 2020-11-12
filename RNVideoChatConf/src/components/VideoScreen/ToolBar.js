import React, {Component} from 'react';
import {StyleSheet, SafeAreaView, TouchableOpacity, View} from 'react-native';
import {CallService} from '../../services';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import customEventEmiter, {CUSTOM_EVENTS} from '../../services/customEvents';

export default class ToolBar extends Component {
  constructor(props) {
    super(props);
    this._setUpListeners();
  }

  state = {
    isAudioMuted: false,
    isFrontCamera: true,
  };

  static getDerivedStateFromProps(props, state) {
    let derivedState = {};

    if (!props.isActiveCall) {
      derivedState.isAudioMuted = false;
      derivedState.isFrontCamera = true;
    }

    return derivedState;
  }

  componentWillUnmount() {
    customEventEmiter.removeListener(
      CUSTOM_EVENTS.STOP_CALL_UI_RESET,
      this._resetUIState,
    );
  }

  _setUpListeners = () => {
    customEventEmiter.addListener(
      CUSTOM_EVENTS.STOP_CALL_UI_RESET,
      this._resetUIState,
    );
  };

  _resetUIState = () => {
    this.props.resetState();
  };

  startCall = () => {
    const {
      selectedUsersIds,
      closeSelect,
      initRemoteStreams,
      setLocalStream,
    } = this.props;

    if (selectedUsersIds.length === 0) {
      CallService.showToast('Select at less one user to start Videocall');
    } else {
      closeSelect();
      initRemoteStreams(selectedUsersIds);
      CallService.startCall(selectedUsersIds).then(setLocalStream);
    }
  };

  stopCall = () => {
    CallService.stopCall();
    this.props.resetState();
  };

  switchCamera = () => {
    const {localStream} = this.props;

    CallService.switchCamera(localStream);
    this.setState((prevState) => ({isFrontCamera: !prevState.isFrontCamera}));
  };

  muteUnmuteAudio = () => {
    this.setState((prevState) => {
      const mute = !prevState.isAudioMuted;
      CallService.setAudioMute();
      return {isAudioMuted: mute};
    });
  };

  _renderCallStartStopButton = (isCallInProgress) => {
    const style = isCallInProgress ? styles.buttonCallEnd : styles.buttonCall;
    const onPress = isCallInProgress ? this.stopCall : this.startCall;
    const type = isCallInProgress ? 'call-end' : 'call';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, style]}
        onPress={onPress}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  _renderMuteButton = () => {
    const {isAudioMuted} = this.state;
    const type = isAudioMuted ? 'mic-off' : 'mic';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonMute]}
        onPress={this.muteUnmuteAudio}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  _renderSwitchVideoSourceButton = () => {
    const {isFrontCamera} = this.state;
    const type = isFrontCamera ? 'camera-rear' : 'camera-front';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonSwitch]}
        onPress={this.switchCamera}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  render() {
    const {isActiveSelect, isActiveCall} = this.props;
    const isCallInProgress = isActiveCall || !isActiveSelect;
    const isAvailableToSwitch =
      isActiveCall && CallService.mediaDevices.length > 1;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.toolBarItem}>
          {isActiveCall && this._renderMuteButton()}
        </View>
        <View style={styles.toolBarItem}>
          {this._renderCallStartStopButton(isCallInProgress)}
        </View>
        <View style={styles.toolBarItem}>
          {isAvailableToSwitch && this._renderSwitchVideoSourceButton()}
        </View>
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
