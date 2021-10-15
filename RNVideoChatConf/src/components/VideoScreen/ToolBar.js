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
    isVideoMuted: false,
    isFrontCamera: true,
  };

  static getDerivedStateFromProps(props, state) {
    let derivedState = {};

    if (!props.isActiveCall) {
      derivedState.isAudioMuted = false;
      derivedState.isVideoMuted = false;
      derivedState.isFrontCamera = true;
    } else {
      derivedState.isAudioMuted = CallService.isAudioMuted();
      derivedState.isVideoMuted = CallService.isVideoMuted();
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
    this.setState(prevState => ({isFrontCamera: !prevState.isFrontCamera}));
  };

  muteUnmuteAudio = () => {
    const isAudioMuted = CallService.setAudioMute();

    this.setState({isAudioMuted});
  };

  muteUnmuteVideo = () => {
    const isVideoMuted = CallService.setVideoMute();

    this.setState({isVideoMuted});
  };

  _renderCallStartStopButton = isCallInProgress => {
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

  _renderMuteMicButton = () => {
    const {isAudioMuted} = this.state;
    const type = isAudioMuted ? 'mic-off' : 'mic';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonMuteMic]}
        onPress={this.muteUnmuteAudio}>
        <MaterialIcon name={type} size={32} color="white" />
      </TouchableOpacity>
    );
  };

  _renderMuteCamButton = () => {
    const {isVideoMuted} = this.state;
    const type = isVideoMuted ? 'videocam-off' : 'videocam';

    return (
      <TouchableOpacity
        style={[styles.buttonContainer, styles.buttonMuteCam]}
        onPress={this.muteUnmuteVideo}>
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
    const {isVideoMuted} = this.state;
    const {isActiveSelect, isActiveCall} = this.props;
    const isCallInProgress = isActiveCall || !isActiveSelect;
    const isAvailableToSwitch =
      isActiveCall && CallService.mediaDevices.length > 1 && !isVideoMuted;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.toolBarItem}>
          {isActiveCall && this._renderMuteMicButton()}
        </View>
        <View style={styles.toolBarItem}>
          {isActiveCall && this._renderMuteCamButton()}
        </View>
        <View style={styles.toolBarItem}>
          {this._renderCallStartStopButton(isCallInProgress)}
        </View>
        <View style={styles.toolBarItem} />
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
  buttonMuteMic: {
    backgroundColor: 'blue',
  },
  buttonMuteCam: {
    backgroundColor: 'green',
  },
  buttonSwitch: {
    backgroundColor: 'orange',
  },
});
