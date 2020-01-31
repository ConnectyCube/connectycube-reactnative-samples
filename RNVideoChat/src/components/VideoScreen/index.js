import React from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import {RTCView} from 'react-native-webrtc';
import {CallService, AuthService} from '../../services';
import ToolBar from './ToolBar';
import CallingLoader from './CallingLoader';

export default class VideoScreen extends React.Component {
  state = {
    isCalling: false,
    isActiveCall: false,
    localStream: null,
    remoteStreams: [],
  };

  componentDidMount() {
    this.setUpListeners();
  }

  componentWillUnmount() {
    AuthService.logout();
    CallService.stopCall();
  }

  setUpListeners() {
    ConnectyCube.videochat.onCallListener = (session, extension) => {
      CallService.processOnCallListener(session, extension).then(stream => {
        this.setCalling();
        this.setLocalStream(stream);
      });
    };

    ConnectyCube.videochat.onAcceptCallListener = (
      session,
      userId,
      extension,
    ) => {
      CallService.processOnAcceptCallListener(session, extension);
      this.setOnCall();
    };

    ConnectyCube.videochat.onRejectCallListener = (
      session,
      userId,
      extension,
    ) => {
      CallService.processOnRejectCallListener(session, extension);
      this.resetState();
    };

    ConnectyCube.videochat.onStopCallListener = (
      session,
      userId,
      extension,
    ) => {
      CallService.processOnStopCallListener(session, extension);
      this.resetState();
    };

    ConnectyCube.videochat.onUserNotAnswerListener = (session, userId) => {
      CallService.processOnUserNotAnswer(session, userId);
      this.resetState();
    };

    ConnectyCube.videochat.onRemoteStreamListener = (
      session,
      userID,
      stream,
    ) => {
      this.setState(({remoteStreams}) => ({
        remoteStreams: [...remoteStreams, {userID, stream}],
        isCalling: false,
        isActiveCall: true,
      }));
    };

    ConnectyCube.videochat.onSessionConnectionStateChangedListener = (
      session,
      userID,
      connectionState,
    ) => {
      console.log('change', userID, connectionState);
    };
  }

  setCalling = () => this.setState({isCalling: true, isActiveCall: false});

  setOnCall = () => this.setState({isCalling: false, isActiveCall: true});

  setLocalStream = stream => this.setState({localStream: stream});

  resetState = () =>
    this.setState({
      isCalling: false,
      isActiveCall: false,
      localStream: null,
      remoteStreams: [],
    });

  render() {
    const {isCalling, isActiveCall, localStream, remoteStreams} = this.state;
    const {navigation} = this.props;
    const opponentsIds = navigation.getParam('opponentsIds');

    CallService.setSpeakerphoneOn(remoteStreams.length > 0);

    return (
      <View style={styles.screen}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <View removeClippedSubviews style={styles.rtcWrap}>
          {remoteStreams.map(({userId, stream}) => (
            <RTCView
              objectFit="cover"
              style={styles.rtcView}
              key={userId}
              streamURL={stream.toURL()}
            />
          ))}
          {localStream && (
            <RTCView
              objectFit="cover"
              style={styles.rtcView}
              key="localStream"
              streamURL={localStream.toURL()}
            />
          )}
        </View>
        {isCalling && <CallingLoader />}
        <ToolBar
          opponentsIds={opponentsIds}
          localStream={localStream}
          isCalling={isCalling}
          isActiveCall={isActiveCall}
          setCalling={this.setCalling}
          setLocalStream={this.setLocalStream}
          resetState={this.resetState}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'black',
  },
  rtcWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  rtcView: {
    flex: 1,
    backgroundColor: 'black',
  },
});
