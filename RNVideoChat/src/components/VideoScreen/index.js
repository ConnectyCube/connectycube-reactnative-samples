import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import RTCViewGrid from './RTCViewGrid';
import {CallService, AuthService} from '../../services';
import ToolBar from './ToolBar';
import UsersSelect from './UsersSelect';

export default class VideoScreen extends React.Component {
  constructor(props) {
    super(props);

    this.opponentsIds = props.navigation.getParam('opponentsIds');

    this.state = {
      localStream: null,
      remoteStreams: [],
      selectedUsersIds: [],
      isActiveSelect: true,
      isActiveCall: false,
    };

    this._setUpListeners();
  }

  componentWillUnmount() {
    AuthService.logout();
    CallService.stopCall();
  }

  componentDidUpdate(prevProps, prevState) {
    const currState = this.state;

    if (
      prevState.remoteStreams.length === 1 &&
      currState.remoteStreams.length === 0
    ) {
      CallService.stopCall();
      this.resetState();
    }
  }

  selectUser = userId =>
    this.setState(prevState => ({
      selectedUsersIds: [...prevState.selectedUsersIds, userId],
    }));

  unselectUser = userId =>
    this.setState(prevState => ({
      selectedUsersIds: prevState.selectedUsersIds.filter(id => userId !== id),
    }));

  closeSelect = () => this.setState({isActiveSelect: false});

  setOnCall = () => this.setState({isActiveCall: true});

  initRemoteStreams = opponentsIds => {
    const emptyStreams = opponentsIds.map(userId => ({
      userId,
      stream: null,
    }));

    this.setState({remoteStreams: emptyStreams});
  };

  updateRemoteStream = (userId, stream) => {
    this.setState(({remoteStreams}) => {
      const updatedRemoteStreams = remoteStreams.map(item => {
        if (item.userId === userId) {
          return {userId, stream};
        }

        return {userId: item.userId, stream: item.stream};
      });

      return {remoteStreams: updatedRemoteStreams};
    });
  };

  removeRemoteStream = userId => {
    this.setState(({remoteStreams}) => ({
      remoteStreams: remoteStreams.filter(item => item.userId !== userId),
    }));
  };

  setLocalStream = stream => this.setState({localStream: stream});

  resetState = () =>
    this.setState({
      localStream: null,
      remoteStreams: [],
      selectedUsersIds: [],
      isActiveSelect: true,
      isActiveCall: false,
    });

  _setUpListeners() {
    ConnectyCube.videochat.onCallListener = this._onCallListener;
    ConnectyCube.videochat.onAcceptCallListener = this._onAcceptCallListener;
    ConnectyCube.videochat.onRejectCallListener = this._onRejectCallListener;
    ConnectyCube.videochat.onStopCallListener = this._onStopCallListener;
    ConnectyCube.videochat.onUserNotAnswerListener = this._onUserNotAnswerListener;
    ConnectyCube.videochat.onRemoteStreamListener = this._onRemoteStreamListener;
  }

  _onCallListener = (session, extension) => {
    CallService.processOnCallListener(session).then(stream => {
      const {opponentsIDs, initiatorID, currentUserID} = session;
      const opponentsIds = [initiatorID, ...opponentsIDs].filter(
        userId => currentUserID !== userId,
      );

      this.initRemoteStreams(opponentsIds);
      this.setLocalStream(stream);
      this.closeSelect();
    });
  };

  _onAcceptCallListener = (session, userId, extension) => {
    this.setOnCall();
  };

  _onRejectCallListener = (session, userId, extension) => {
    CallService.processOnRejectCallListener(userId);
  };

  _onStopCallListener = (session, userId, extension) => {
    const isStoppedByInitiator = session.initiatorID === userId;

    CallService.processOnStopCallListener(userId, isStoppedByInitiator);

    if (isStoppedByInitiator) {
      this.resetState();
    } else {
      this.removeRemoteStream(userId);
    }
  };

  _onUserNotAnswerListener = (session, userId) => {
    CallService.processOnUserNotAnswer(userId);
    this.removeRemoteStream(userId);
  };

  _onRemoteStreamListener = (session, userId, stream) => {
    this.updateRemoteStream(userId, stream);
    this.setOnCall();
  };

  render() {
    const {
      localStream,
      remoteStreams,
      selectedUsersIds,
      isActiveSelect,
      isActiveCall,
    } = this.state;

    const localStreamItem = localStream
      ? [{userId: 'localStream', stream: localStream}]
      : [];
    const streams = [...remoteStreams, ...localStreamItem];

    CallService.setSpeakerphoneOn(remoteStreams.length > 0);

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <RTCViewGrid streams={streams} />
        <UsersSelect
          isActiveSelect={isActiveSelect}
          opponentsIds={this.opponentsIds}
          selectedUsersIds={selectedUsersIds}
          selectUser={this.selectUser}
          unselectUser={this.unselectUser}
        />
        <ToolBar
          selectedUsersIds={selectedUsersIds}
          localStream={localStream}
          isActiveSelect={isActiveSelect}
          isActiveCall={isActiveCall}
          closeSelect={this.closeSelect}
          initRemoteStreams={this.initRemoteStreams}
          setLocalStream={this.setLocalStream}
          resetState={this.resetState}
        />
      </SafeAreaView>
    );
  }
}
