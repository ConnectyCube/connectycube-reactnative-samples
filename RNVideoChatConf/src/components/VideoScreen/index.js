import React from 'react';
import { useRoute } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import AwesomeAlert from 'react-native-awesome-alerts';
import RTCViewGrid from './RTCViewGrid';
import { CallService, AuthService } from '../../services';
import ToolBar from './ToolBar';
import UsersSelect from './UsersSelect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VideoScreen = () => {
  const route = useRoute();
  const { top } = useSafeAreaInsets();
  const opponentsIds = route?.params?.opponentsIds ?? [];
  const [localStream, _setLocalStream] = React.useState(null);
  const [remoteStreams, _setRemoteStreams] = React.useState([]);
  const [selectedUsersIds, setSelectedUsersIds] = React.useState([]);
  const [isActiveSelect, setIsActiveSelect] = React.useState(true);
  const [isActiveCall, setIsActiveCall] = React.useState(false);
  const [isIncomingCall, setIsIncomingCall] = React.useState(false);
  const initiatorName = React.useMemo(() => {
    return isIncomingCall ? CallService.getInitiatorName() : '';
  }, [isIncomingCall]);
  const localStreamItem = React.useMemo(() => {
    return localStream ? [{ userId: 'localStream', stream: localStream }] : [];
  }, [localStream]);
  const streams = [...remoteStreams, ...localStreamItem];

  const setLocalStream = (nextStream) => {
    _setLocalStream(null);

    if (nextStream) {
      requestAnimationFrame(() => {
        _setLocalStream(nextStream);
      });
    }
  };

  const setRemoteStreams = (nextRemoteStreams) => {
    requestAnimationFrame(() => {
      _setRemoteStreams(nextRemoteStreams);
    });
  };

  React.useEffect(() => {
    CallService.setSpeakerphoneOn(remoteStreams.length > 0);
    setUpListeners();

    return () => {
      CallService.stopCall();
      AuthService.logout();
    };
  }, []);

  const initRemoteStreams = React.useCallback((ids) => {
    const emptyStreams = ids.map((userId) => ({
      userId,
      stream: null,
    }));

    setRemoteStreams(emptyStreams);
  }, []);

  const updateRemoteStream = (userId, stream) => {
    setRemoteStreams((prevRemoteStreams) =>
      prevRemoteStreams.map((item) =>
        item.userId === userId
          ? { userId, stream }
          : { userId: item.userId, stream: item.stream },
      ),
    );
  };

  const removeRemoteStream = (userId) => {
    setRemoteStreams((prevRemoteStreams) =>
      prevRemoteStreams.filter((item) => item.userId !== userId),
    );
  };

  const showIncomingCallModal = () => setIsIncomingCall(true);

  const hideIncomingCallModal = () => setIsIncomingCall(false);

  const selectUser = (userId) => {
    setSelectedUsersIds((prevSelectedUsersIds) => [
      ...prevSelectedUsersIds,
      userId,
    ]);
  };

  const unselectUser = (userId) => {
    setSelectedUsersIds((prevSelectedUsersIds) =>
      prevSelectedUsersIds.filter((id) => userId !== id),
    );
  };

  const closeSelect = () => setIsActiveSelect(false);

  const setOnCall = () => setIsActiveCall(true);

  const resetState = React.useCallback(() => {
    setLocalStream(null);
    setRemoteStreams([], 'resetState');
    setSelectedUsersIds([]);
    setIsActiveSelect(true);
    setIsActiveCall(false);
  }, []);

  const onSystemMessage = (msg) => {
    CallService.onSystemMessage(
      msg,
      showIncomingCallModal,
      hideIncomingCallModal,
    );
  };

  const onStopCallListener = (session, userId, extension) => {
    const isStoppedByInitiator = session.initiatorID === userId;

    try {
      CallService.processOnStopCallListener(userId, isStoppedByInitiator);

      if (isStoppedByInitiator) {
        resetState();
      } else {
        removeRemoteStream(userId);
      }
    } catch (error) {
      hideIncomingCallModal();
    }
  };

  const onRemoteStreamListener = (_session, userId, stream) => {
    console.log('[onRemoteStreamListener]', userId, stream);

    if (CallService.hasSession) {
      setOnCall();
      updateRemoteStream(userId, stream);
    } else {
      hideIncomingCallModal();
    }
  };

  const onAcceptCallListener = (session, userId, displayName) => {
    CallService.processOnAcceptCallListener(session, userId, displayName);
  };

  const onSlowLinkListener = (_session, userId, uplink, nacks) => {
    console.log('[onSlowLinkListener]', userId, uplink, nacks);
  };

  const onRemoteConnectionStateChangedListener = (
    _session,
    userId,
    iceState,
  ) => {
    console.log('[onRemoteConnectionStateChangedListener]', userId, iceState);
  };

  const onSessionConnectionStateChangedListener = (_session, iceState) => {
    console.log('[onSessionConnectionStateChangedListener]', iceState);
  };

  const setUpListeners = () => {
    ConnectyCube.chat.onSystemMessageListener = onSystemMessage;
    ConnectyCube.videochatconference.onParticipantLeftListener =
      onStopCallListener;
    ConnectyCube.videochatconference.onRemoteStreamListener =
      onRemoteStreamListener;
    ConnectyCube.videochatconference.onParticipantJoinedListener =
      onAcceptCallListener;
    ConnectyCube.videochatconference.onSlowLinkListener = onSlowLinkListener;
    ConnectyCube.videochatconference.onRemoteConnectionStateChangedListener =
      onRemoteConnectionStateChangedListener;
    ConnectyCube.videochatconference.onSessionConnectionStateChangedListener =
      onSessionConnectionStateChangedListener;
  };

  const onPressAccept = () => {
    CallService.acceptCall().then((stream) => {
      const participantIds = CallService.getParticipantIds();
      initRemoteStreams(participantIds);
      setLocalStream(stream);
      closeSelect();
      hideIncomingCallModal();
    });
  };

  const onPressReject = () => {
    CallService.rejectCall();
    hideIncomingCallModal();
  };

  return (
    <View style={styles.wrap(top)}>
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
        closeOnHardwareBackPress={true}
        showCancelButton={true}
        showConfirmButton={true}
        cancelText="Reject"
        confirmText="Accept"
        cancelButtonColor="red"
        confirmButtonColor="green"
        onCancelPressed={onPressReject}
        onConfirmPressed={onPressAccept}
        onDismiss={hideIncomingCallModal}
        alertContainerStyle={styles.alertContainer}
        titleStyle={styles.fontSize(21)}
        cancelButtonTextStyle={styles.fontSize(18)}
        confirmButtonTextStyle={styles.fontSize(18)}
      />
    </View>
  );
};

export default VideoScreen;

const styles = StyleSheet.create({
  wrap: (top = 0) => ({
    flex: 1,
    backgroundColor: 'black',
    paddingTop: top,
  }),
  alertContainer: {
    zIndex: 1,
  },
  fontSize: (size = 18) => {
    return { fontSize: size };
  },
});
