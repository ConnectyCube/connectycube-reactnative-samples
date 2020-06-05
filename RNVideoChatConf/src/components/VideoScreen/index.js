import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import AwesomeAlert from 'react-native-awesome-alerts';
import RTCViewGrid from './RTCViewGrid';
import { CallService, AuthService } from '../../services';
import ToolBar from './ToolBar';
import UsersSelect from './UsersSelect';

export default class VideoScreen extends React.Component {
  constructor(props) {
    super(props);

    this._session = null;
    this.opponentsIds = props.navigation.getParam('opponentsIds');

    this.state = {
      localStream: null,
      remoteStreams: [],
      selectedUsersIds: [],
      isActiveSelect: true,
      isActiveCall: false,
      isIncomingCall: false,
    };

    this._setUpListeners();
  }

  componentWillUnmount() {
    CallService.stopCall();
    AuthService.logout();
  }

  showInomingCallModal = session => {
    this._session = session;
    this.setState({ isIncomingCall: true });
  };

  hideInomingCallModal = () => {
    this.setState({ isIncomingCall: false });
  };

  selectUser = userId => {
    this.setState(prevState => ({
      selectedUsersIds: [...prevState.selectedUsersIds, userId],
    }));
  };

  unselectUser = userId => {
    this.setState(prevState => ({
      selectedUsersIds: prevState.selectedUsersIds.filter(id => userId !== id),
    }));
  };

  closeSelect = () => {
    this.setState({ isActiveSelect: false });
  };

  setOnCall = () => {
    this.setState({ isActiveCall: true });
  };

  initRemoteStreams = opponentsIds => {
    const emptyStreams = opponentsIds.map(userId => ({
      userId,
      stream: null,
    }));

    this.setState({ remoteStreams: emptyStreams });
  };

  updateRemoteStream = (userId, stream) => {
    this.setState(({ remoteStreams }) => {
      const updatedRemoteStreams = remoteStreams.map(item => {
        if (item.userId === userId) {
          return { userId, stream };
        }

        return { userId: item.userId, stream: item.stream };
      });

      return { remoteStreams: updatedRemoteStreams };
    });
  };

  removeRemoteStream = userId => {
    this.setState(({ remoteStreams }) => ({
      remoteStreams: remoteStreams.filter(item => item.userId !== userId),
    }));
  };

  setLocalStream = stream => {
    this.setState({ localStream: stream });
  };

  resetState = () => {
    this.setState({
      localStream: null,
      remoteStreams: [],
      selectedUsersIds: [],
      isActiveSelect: true,
      isActiveCall: false,
    });
  };

  _setUpListeners = () => {
    ConnectyCube.chat.onSystemMessageListener = this.onSystemMessage.bind(this);
    ConnectyCube.videochatconference.onParticipantLeftListener = this.onStopCallListener.bind(this);
    ConnectyCube.videochatconference.onRemoteStreamListener = this.onRemoteStreamListener.bind(this);
    // ConnectyCube.videochatconference.onParticipantJoinedListener = this.onAcceptCallListener.bind(this);
    // ConnectyCube.videochatconference.onSlowLinkListener = this.onSlowLinkListener.bind(this);
    // ConnectyCube.videochatconference.onRemoteConnectionStateChangedListener = this.onRemoteConnectionStateChangedListener.bind(this);
    // ConnectyCube.videochatconference.onSessionConnectionStateChangedListener = this.onSessionConnectionStateChangedListener.bind(this);
  };

  onSystemMessage = (msg) => {
    CallService.onSystemMessage(
      msg,
      this.showInomingCallModal,
      this.hideInomingCallModal
    )
  }

  _onPressAccept = () => {
    CallService.acceptCall().then(stream => {
      this.initRemoteStreams([72780]); // ned refactor
      this.setLocalStream(stream);
      this.closeSelect();
      this.hideInomingCallModal();
    });
  };

  _onPressReject = () => {
    CallService.rejectCall();
    this.hideInomingCallModal();
  };


  // _onRejectCallListener = (session, userId, extension) => {
  //   CallService.processOnRejectCallListener(session, userId, extension)
  //     .then(() => this.removeRemoteStream(userId))
  //     .catch(this.hideInomingCallModal);
  // };


  // _onUserNotAnswerListener = (session, userId) => {
  //   CallService.processOnUserNotAnswerListener(userId)
  //     .then(() => this.removeRemoteStream(userId))
  //     .catch(this.hideInomingCallModal);
  // };

  onRemoteStreamListener = (session, userId, stream) => {
    CallService.processOnRemoteStreamListener(userId)
      .then(() => {
        this.updateRemoteStream(userId, stream);
        this.setOnCall();
      })
      .catch(this.hideInomingCallModal);
  };

  render() {
    const {
      localStream,
      remoteStreams,
      selectedUsersIds,
      isActiveSelect,
      isActiveCall,
      isIncomingCall,
    } = this.state;

    // const initiatorName = isIncomingCall
    //   ? CallService.getUserById(this._session.initiatorID, 'name')
    //   : '';
    const initiatorName = 'name';
    const localStreamItem = localStream
      ? [{ userId: 'localStream', stream: localStream }]
      : [];
    const streams = [...remoteStreams, ...localStreamItem];

    // CallService.setSpeakerphoneOn(remoteStreams.length > 0);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
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
        <AwesomeAlert
          show={isIncomingCall}
          showProgress={false}
          title={`Incoming call from ${initiatorName}`}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="Reject"
          confirmText="Accept"
          cancelButtonColor="red"
          confirmButtonColor="green"
          onCancelPressed={this._onPressReject}
          onConfirmPressed={this._onPressAccept}
          onDismiss={this.hideInomingCallModal}
          alertContainerStyle={{ zIndex: 1 }}
          titleStyle={{ fontSize: 21 }}
          cancelButtonTextStyle={{ fontSize: 18 }}
          confirmButtonTextStyle={{ fontSize: 18 }}
        />
      </SafeAreaView>
    );
  }
}
