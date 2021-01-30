import React from 'react';
import { SafeAreaView, StatusBar, Text, StyleSheet } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import AwesomeAlert from 'react-native-awesome-alerts';
import RTCViewGrid from './RTCViewGrid';
import { CallService, AuthService, PushNotificationsService, UtilsService, CallKitService } from '../../services';
import ToolBar from './ToolBar';
import UsersSelect from './UsersSelect';
import { getUserById } from '../../utils'

export default class VideoScreen extends React.Component {
  constructor(props) {
    super(props);

    this._session = null;

    this.opponents = props.navigation.getParam('opponents');
    this.opponentsIds = this.opponents.map(o => o.id);
    this.currentUser = props.navigation.getParam('currentUser');

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

  showInomingCallModal = session => {
    this._session = session;
    this.setState({isIncomingCall: true});
  };

  hideInomingCallModal = () => {
    this._session = null;
    this.setState({isIncomingCall: false});
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
    this.setState({isActiveSelect: false});
  };

  setOnCall = () => {
    this.setState({isActiveCall: true});
  };

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

  setLocalStream = stream => {
    this.setState({localStream: stream});
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

  _setUpListeners() {
    ConnectyCube.videochat.onCallListener = this._onCallListener;
    ConnectyCube.videochat.onAcceptCallListener = this._onAcceptCallListener;
    ConnectyCube.videochat.onRejectCallListener = this._onRejectCallListener;
    ConnectyCube.videochat.onStopCallListener = this._onStopCallListener;
    ConnectyCube.videochat.onUserNotAnswerListener = this._onUserNotAnswerListener;
    ConnectyCube.videochat.onRemoteStreamListener = this._onRemoteStreamListener;
  }

  _startCall = () => {
    const {
      selectedUsersIds,
    } = this.state;

    if (selectedUsersIds.length === 0) {
      UtilsService.showToast('Select at less one user to start a call');
    } else {
      this.closeSelect();
      this.initRemoteStreams(selectedUsersIds);

      // initiate a call
      CallService.startCall(selectedUsersIds, ConnectyCube.videochat.CallType.VIDEO).then(this.setLocalStream);

      const callUDID = UtilsService.uuidv4()
      const callType = "video" // "voice"

      // sendd push notitification
      const pushParams = {
        message: `Incoming call from ${this.currentUser.name}`,
        ios_voip: 1,
        callerName: this.currentUser.name,
        handle: this.currentUser.name,
        uuid: callUDID,
        callType
      };
      PushNotificationsService.sendPushNotification(selectedUsersIds, pushParams);

      // report to CallKit
      let opponentsNamesString = ""
      for (let i = 0; i < selectedUsersIds.length; ++i) {
        opponentsNamesString += getUserById(selectedUsersIds[i]).name
        if (i !== (selectedUsersIds.length - 1)) {
          opponentsNamesString += ", "
        }
      }
      //
      CallKitService.reportStartCall(
        callUDID,
        this.currentUser.name,
        opponentsNamesString,
        "generic",
        callType === "video"
      );
    }
  };

  _stopCall = () => {
    CallService.stopCall();

    this.resetState();
  };

  _onPressAccept = () => {
    CallService.acceptCall(this._session).then(stream => {
      const {opponentsIDs, initiatorID, currentUserID} = this._session;
      const opponentsIds = [initiatorID, ...opponentsIDs].filter(
        userId => currentUserID !== userId,
      );

      this.initRemoteStreams(opponentsIds);
      this.setLocalStream(stream);
      this.closeSelect();
      this.hideInomingCallModal();
    });
  };

  _onPressReject = () => {
    CallService.rejectCall(this._session);
    this.hideInomingCallModal();
  };

  _onCallListener = (session, extension) => {
    CallService.processOnCallListener(session)
      .then(() => this.showInomingCallModal(session))
      .catch(this.hideInomingCallModal);
  };

  _onAcceptCallListener = (session, userId, extension) => {
    CallService.processOnAcceptCallListener(session, userId, extension)
      .then(res => {
        UtilsService.showToast(`${getUserById(userId, 'name')} has accepted the call`);

        this.setOnCall()
      })
      .catch(err => {
        UtilsService.showToast('You have accepted the call on other side');

        this.hideInomingCallModal()
      });
  };

  _onRejectCallListener = (session, userId, extension) => {
    CallService.processOnRejectCallListener(session, userId, extension)
      .then(() => {
        this.removeRemoteStream(userId)

        const userName = getUserById(userId, 'name');
        const message = extension.busy
          ? `${userName} is busy`
          : `${userName} rejected the call request`;

        UtilsService.showToast(message);
      }).catch(e => {
        UtilsService.showToast('You have rejected the call on other side');

        this.hideInomingCallModal()
      });
  };

  _onStopCallListener = (session, userId, extension) => {
    const isStoppedByInitiator = session.initiatorID === userId;

    CallService.processOnStopCallListener()
      .then(() => {
        const userName = getUserById(userId, 'name');
        const message = `${userName} has ${isStoppedByInitiator ? 'stopped' : 'left'} the call`;

        UtilsService.showToast(message);

        if (isStoppedByInitiator) {
          this.resetState();
        } else {
          this.removeRemoteStream(userId);
        }
      })
      .catch(this.hideInomingCallModal);
  };

  _onUserNotAnswerListener = (session, userId) => {
    CallService.processOnUserNotAnswerListener(userId)
      .then(() => {
        UtilsService.showToast(`${getUserById(userId, 'name')} did not answer`);

        this.removeRemoteStream(userId)
      }).catch(this.hideInomingCallModal);
  };

  _onRemoteStreamListener = (session, userId, stream) => {
    CallService.processOnRemoteStreamListener(userId)
      .then(() => {
        this.updateRemoteStream(userId, stream);
        this.setOnCall();
      }).catch(this.hideInomingCallModal);
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

    const initiatorName = isIncomingCall
      ? getUserById(this._session.initiatorID, 'name')
      : '';
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
          localStream={localStream}
          isActiveSelect={isActiveSelect}
          isActiveCall={isActiveCall}
          startCall={this._startCall}
          stopCall={this._stopCall}
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
          alertContainerStyle={{zIndex: 1}}
          titleStyle={{fontSize: 21}}
          cancelButtonTextStyle={{fontSize: 18}}
          confirmButtonTextStyle={{fontSize: 18}}
        />
      </SafeAreaView>
    );
  }
}
