import React, { useRef, useState, useEffect, useContext } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import AwesomeAlert from 'react-native-awesome-alerts';
import RTCViewGrid from './RTCViewGrid';
import ToolBar from './ToolBar';
import UsersSelect from './UsersSelect';
import CallContext from '../../services/call-service';
import AuthContext from '../../services/auth-service';

const VideoScreen = ({ navigation }) => {
  const _session = useRef(null);
  const opponentsIds = navigation.getParam('opponentsIds');
  const CallService = useContext(CallContext);
  const { logout } = useContext(AuthContext);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const prevRemoteStreams = useRef(remoteStreams);
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);
  const [isActiveSelect, setIsActiveSelect] = useState(true);
  const [isActiveCall, setIsActiveCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  const initiatorName = isIncomingCall
    ? CallService.getUserById(_session.current.initiatorID, 'name')
    : '';
  const localStreamItem = localStream
    ? [{ userId: 'localStream', stream: localStream }]
    : [];
  const streams = [...remoteStreams, ...localStreamItem];

  useEffect(() => {
    _setUpListeners();
    return () => {
      CallService.stopCall();
      logout();
    };
  }, []);

  useEffect(() => {
    if (prevRemoteStreams.current.length === 1
      && remoteStreams.length === 0) {
      CallService.stopCall();
      resetState();
    }
    CallService.setSpeakerphoneOn(remoteStreams.length > 0);
  }, [remoteStreams.length]);

  const showInomingCallModal = session => {
    _session.current = session;
    setIsIncomingCall(true);
  };

  const hideInomingCallModal = () => {
    _session.current = null;
    setIsIncomingCall(false);
  };

  const selectUser = userId => {
    setSelectedUsersIds([...selectedUsersIds, userId]);
  };

  const unselectUser = userId => {
    setSelectedUsersIds(selectedUsersIds.filter(id => userId !== id));
  };

  const closeSelect = () => {
    setIsActiveSelect(false);
  };

  const setOnCall = () => {
    setIsActiveCall(true);
  };

  const initRemoteStreams = opponentsIds => {
    setRemoteStreams(opponentsIds.map(userId => ({ userId, stream: null })));
  };

  const updateRemoteStream = (userId, stream) => {
    setRemoteStreams([...remoteStreams, { userId, stream }]);
  };

  const removeRemoteStream = userId => {
    setRemoteStreams(
      remoteStreams.filter(item => item.userId !== userId),
    );
  };

  const resetState = () => {
    setLocalStream(null);
    setRemoteStreams([]);
    setSelectedUsersIds([]);
    setIsActiveSelect(true);
    setIsActiveCall(false);
  };

  const _setUpListeners = () => {
    ConnectyCube.videochat.onCallListener = _onCallListener;
    ConnectyCube.videochat.onAcceptCallListener = _onAcceptCallListener;
    ConnectyCube.videochat.onRejectCallListener = _onRejectCallListener;
    ConnectyCube.videochat.onStopCallListener = _onStopCallListener;
    ConnectyCube.videochat.onUserNotAnswerListener = _onUserNotAnswerListener;
    ConnectyCube.videochat.onRemoteStreamListener = _onRemoteStreamListener;
  };

  const _onPressAccept = async () => {
    const stream = await CallService.acceptCall(_session.current);
    const { opponentsIDs, initiatorID, currentUserID } = _session.current;
    const opponentsIds = [initiatorID, ...opponentsIDs].filter(
      userId => currentUserID !== userId,
    );

    initRemoteStreams(opponentsIds);
    setLocalStream(stream);
    closeSelect();
    hideInomingCallModal();
  };

  const _onPressReject = () => {
    CallService.rejectCall(_session.current);
    hideInomingCallModal();
  };

  const _onCallListener = async (session, extension) => {
    try {
      await CallService.processOnCallListener(session);
      showInomingCallModal(session);
    } catch (error) {
      hideInomingCallModal(error);
    }
  };

  const _onAcceptCallListener = async (session, userId, extension) => {
    try {
      const result = await CallService.processOnAcceptCallListener(session, userId, extension);
      setOnCall(result);
    } catch (error) {
      hideInomingCallModal(error);
    }
  };

  const _onRejectCallListener = async (session, userId, extension) => {
    try {
      await CallService.processOnRejectCallListener(session, userId, extension);
      removeRemoteStream(userId);
    } catch (error) {
      hideInomingCallModal(error);
    }
  };

  const _onStopCallListener = async (session, userId, extension) => {
    const isStoppedByInitiator = session.initiatorID === userId;

    try {
      await CallService.processOnStopCallListener(userId, isStoppedByInitiator);
      if (isStoppedByInitiator) {
        resetState();
      } else {
        removeRemoteStream(userId);
      }
    } catch (error) {
      hideInomingCallModal(error);
    }
  };

  const _onUserNotAnswerListener = async (session, userId) => {
    try {
      await CallService.processOnUserNotAnswerListener(userId);
      removeRemoteStream(userId);
    } catch (error) {
      hideInomingCallModal(error);
    }
  };

  const _onRemoteStreamListener = async (session, userId, stream) => {
    try {
      await CallService.processOnRemoteStreamListener(userId);
      updateRemoteStream(userId, stream);
      setOnCall();
    } catch (error) {
      hideInomingCallModal(error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <RTCViewGrid streams={streams} />
      <UsersSelect
        isActiveSelect={isActiveSelect}
        opponentsIds={opponentsIds}
        selectedUsersIds={selectedUsersIds}
        selectUser={selectUser}
        unselectUser={unselectUser}
      />
      <ToolBar
        selectedUsersIds={selectedUsersIds}
        localStream={localStream}
        isActiveSelect={isActiveSelect}
        isActiveCall={isActiveCall}
        closeSelect={closeSelect}
        initRemoteStreams={initRemoteStreams}
        setLocalStream={setLocalStream}
        resetState={resetState}
      />
      <AwesomeAlert
        show={isIncomingCall}
        showProgress={false}
        title={`Incoming call from ${initiatorName}`}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress
        showCancelButton
        showConfirmButton
        cancelText="Reject"
        confirmText="Accept"
        cancelButtonColor="red"
        confirmButtonColor="green"
        onCancelPressed={_onPressReject}
        onConfirmPressed={_onPressAccept}
        onDismiss={hideInomingCallModal}
        alertContainerStyle={{ zIndex: 1 }}
        titleStyle={{ fontSize: 21 }}
        cancelButtonTextStyle={{ fontSize: 18 }}
        confirmButtonTextStyle={{ fontSize: 18 }}
      />
    </SafeAreaView>
  );
};

export default VideoScreen;
