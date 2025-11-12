import React from 'react';
import { useRoute } from '@react-navigation/native';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { ConnectyCube, useConnectyCube } from '@connectycube/react';
// import AwesomeAlert from 'react-native-awesome-alerts';
import RTCViewGrid from './RTCViewGrid';
import CallService from '../../services/call-service';
import ToolBar from './ToolBar';
import UsersSelect from './UsersSelect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const toastConfig = {
  incoming_call: ({ props }) => (
    <View style={styles.toastContainer}>
      <Text style={styles.title}>{props.name}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.button, styles.accept]} onPress={props.onAccept}>
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.reject]} onPress={props.onReject}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  ),
};

const VideoScreen = () => {
  const { destroySession, disconnect, dangerouslySetIsOnline } = useConnectyCube();
  const route = useRoute();
  const { top } = useSafeAreaInsets();
  const opponentsIds = route?.params?.opponentsIds ?? [];
  const [localStream, _setLocalStream] = React.useState(null);
  const [remoteStreams, _setRemoteStreams] = React.useState([]);
  const [selectedUsersIds, setSelectedUsersIds] = React.useState([]);
  const [isActiveSelect, setIsActiveSelect] = React.useState(true);
  const [isActiveCall, setIsActiveCall] = React.useState(false);
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
      destroySession();
      disconnect();
      dangerouslySetIsOnline(false);
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

  const showIncomingCallModal = () => {
    Toast.show({
      type: 'incoming_call',
      position: 'top',
      autoHide: false,
      props: {
        name: `Incoming call from ${CallService.getInitiatorName()}`,
        onAccept: onPressAccept,
        onReject: onPressReject,
      },
    });
    requestAnimationFrame(() => {
      CallService.playSound('incoming');
    });
  };

  const hideIncomingCallModal = () => {
    Toast.hide();
    requestAnimationFrame(() => {
      CallService.stopSounds();
    });
  };

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
      <Toast config={toastConfig} />
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
  // call toast
  toastContainer: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    marginTop: 40,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  title: { color: 'white', fontSize: 18, marginBottom: 15 },
  buttons: { flexDirection: 'row', gap: 10 },
  button: {
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  accept: { backgroundColor: 'green' },
  reject: { backgroundColor: 'red' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
