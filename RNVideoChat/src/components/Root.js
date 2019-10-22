import React from 'react';
import {connect} from 'react-redux';
import ConnectyCube from 'connectycube-reactnative';
import config from '../config';
import AppRouter from '../router';
import {Alert} from 'react-native';
import CallingService from '../services/CallingService';
import {
  videoSessionObtained,
  userIsCalling,
  callInProgress,
  remoteVideoStreamObtained,
  localVideoStreamObtained,
  clearVideoSession,
  clearVideoStreams,
  setMediaDevices,
  setActiveVideoDevice,
} from '../actions/videosession';
import InCallManager from 'react-native-incall-manager';

class AppRoot extends React.Component {
  componentDidMount() {
    ConnectyCube.init(...config);

    this.setupListeners();

    InCallManager.setForceSpeakerphoneOn(true);
  }

  setupListeners() {
    ConnectyCube.videochat.onCallListener = this.onCallListener.bind(this);
    ConnectyCube.videochat.onUserNotAnswerListener = this.onUserNotAnswerListener.bind(
      this,
    );
    ConnectyCube.videochat.onAcceptCallListener = this.onAcceptCallListener.bind(
      this,
    );
    ConnectyCube.videochat.onRemoteStreamListener = this.onRemoteStreamListener.bind(
      this,
    );
    ConnectyCube.videochat.onRejectCallListener = this.onRejectCallListener.bind(
      this,
    );
    ConnectyCube.videochat.onStopCallListener = this.onStopCallListener.bind(
      this,
    );
    ConnectyCube.videochat.onSessionConnectionStateChangedListener = this.onSessionConnectionStateChangedListener.bind(
      this,
    );
  }

  onCallListener(session, extension) {
    console.log('onCallListener, extension: ', extension);

    const {
      videoSessionObtained,
      setMediaDevices,
      localVideoStreamObtained,
      callInProgress,
    } = this.props;

    videoSessionObtained(session);

    Alert.alert(
      'Incoming call',
      'from user',
      [
        {
          text: 'Accept',
          onPress: () => {
            console.log('Accepted call request');

            CallingService.getVideoDevices().then(setMediaDevices);

            CallingService.getUserMedia(session).then(stream => {
              localVideoStreamObtained(stream);
              CallingService.acceptCall(session);
              callInProgress(true);
            });
          },
        },
        {
          text: 'Reject',
          onPress: () => {
            console.log('Rejected call request');
            CallingService.rejectCall(session);
          },
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  }

  onUserNotAnswerListener(session, userId) {
    CallingService.processOnUserNotAnswer(session, userId);

    this.props.userIsCalling(false);
  }

  onAcceptCallListener(session, userId, extension) {
    CallingService.processOnAcceptCallListener(session, extension);
    this.props.callInProgress(true);
  }

  onRemoteStreamListener(session, userID, remoteStream) {
    this.props.remoteVideoStreamObtained(remoteStream, userID);
    this.props.userIsCalling(false);
  }

  onRejectCallListener(session, userId, extension) {
    CallingService.processOnRejectCallListener(session, extension);

    this.props.userIsCalling(false);

    this.props.clearVideoSession();
    this.props.clearVideoStreams();
  }

  onStopCallListener(session, userId, extension) {
    this.props.userIsCalling(false);
    this.props.callInProgress(false);

    this.props.clearVideoSession();
    this.props.clearVideoStreams();

    CallingService.processOnStopCallListener(session, extension);
  }

  onSessionConnectionStateChangedListener(session, userID, connectionState) {
    console.log(
      'onSessionConnectionStateChangedListener',
      userID,
      connectionState,
    );
  }

  render() {
    return <AppRouter />;
  }
}

function mapDispatchToProps(dispatch) {
  return {
    videoSessionObtained: videoSession =>
      dispatch(videoSessionObtained(videoSession)),
    userIsCalling: isCalling => dispatch(userIsCalling(isCalling)),
    callInProgress: inProgress => dispatch(callInProgress(inProgress)),
    remoteVideoStreamObtained: remoteStream =>
      dispatch(remoteVideoStreamObtained(remoteStream)),
    localVideoStreamObtained: localStream =>
      dispatch(localVideoStreamObtained(localStream)),
    clearVideoSession: () => dispatch(clearVideoSession()),
    clearVideoStreams: () => dispatch(clearVideoStreams()),
    setMediaDevices: mediaDevices => dispatch(setMediaDevices(mediaDevices)),
    setActiveVideoDevice: videoDevice =>
      dispatch(setActiveVideoDevice(videoDevice)),
  };
}

export default connect(
  null,
  mapDispatchToProps,
)(AppRoot);
