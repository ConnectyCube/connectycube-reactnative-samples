import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import { CallService, AuthService, PushNotificationsService, CallKitService } from '../../services';
import { getUserById, uuidv4, showToast } from '../../utils'

export default function IncomingCallScreen ({ route }) {
  const opponents = route.params.opponents;
  const opponentsIds = opponents.map(o => o.id);
  const currentUser = route.params.currentUser;

  const _session = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [selectedUsersIds, setSelectedUsersIds] = useState([]);
  const [isSelectUsersViewDisplayed, setIsSelectUsersViewDisplayed] = useState(true);
  const [isActiveCall, setIsActiveCall] = useState(false);
  const [isIncomingCall, setIsIncomingCall] = useState(false);

  const prevRemoteStreams = usePrevious(remoteStreams)

  useEffect(() => {
    _setUpListeners();

    return () => {
      CallService.stopCall();
      AuthService.logout();
    }
  }, []);

  useEffect(() => {
    if (prevRemoteStreams?.length > 0 && remoteStreams.length === 0) {
      CallService.stopCall();
      resetState()
    }
  }, [remoteStreams]);

  function _setUpListeners() {
    ConnectyCube.videochat.onCallListener = _onCallListener;
    ConnectyCube.videochat.onAcceptCallListener = _onAcceptCallListener;
    ConnectyCube.videochat.onRejectCallListener = _onRejectCallListener;
    ConnectyCube.videochat.onStopCallListener = _onStopCallListener;
    ConnectyCube.videochat.onUserNotAnswerListener = _onUserNotAnswerListener;
    ConnectyCube.videochat.onRemoteStreamListener = _onRemoteStreamListener;
  }
  
  function resetState() {
    setIsActiveCall(false)
    setLocalStream(null)
    setRemoteStreams([])
    setSelectedUsersIds([])
    setIsSelectUsersViewDisplayed(true)
  };

  function clearCall() {
    _session.current == null;

    setIsIncomingCall(false)
  };

  function selectUser(userId) {
    console.log("selectUser", userId)
    setSelectedUsersIds([...selectedUsersIds, userId])
  };

  function unselectUser(userId) {
    console.log("unselectUser", userId)
    setSelectedUsersIds(selectedUsersIds.filter(id => userId !== id))
  };

  function initRemoteStreams(opponentsIds) {
    const emptyStreams = opponentsIds.map(userId => ({
      userId,
      stream: null,
    }));

    setRemoteStreams(emptyStreams)
  };

  function updateRemoteStream(userId, stream) {
    const updatedRemoteStreams = remoteStreams.map(item => {
      if (item.userId === userId) {
        return {userId, stream};
      }

      return {userId: item.userId, stream: item.stream};
    });

    setRemoteStreams(updatedRemoteStreams)
  };

  function removeRemoteStream(userId){
    setRemoteStreams(remoteStreams.filter(item => item.userId !== userId));
  };

  async function _startCall() {
    if (selectedUsersIds.length === 0) {
      showToast('Select at less one user to start a call');
      return;
    }
 
    setIsSelectUsersViewDisplayed(false)

    initRemoteStreams(selectedUsersIds);

    // initiate a call
    const stream = await CallService.startCall(selectedUsersIds, ConnectyCube.videochat.CallType.VIDEO)
    setLocalStream(stream)

    const callUDID = uuidv4()
    const callType = "video" // "voice"

    // sendd push notitification
    const pushParams = {
      message: `Incoming call from ${currentUser.name}`,
      ios_voip: 1,
      callerName: currentUser.name,
      handle: currentUser.name,
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
      currentUser.name,
      opponentsNamesString,
      "generic",
      callType === "video"
    );
  }

  function _stopCall(){
    CallService.stopCall();

    resetState();
  }

  async function _onPressAccept(){
    const stream = await CallService.acceptCall(_session.current)

    const {opponentsIDs, initiatorID, currentUserID} = _session.current;
    const _oIds = [initiatorID, ...opponentsIDs].filter(
      userId => currentUserID !== userId,
    );

    initRemoteStreams(_oIds);
    setLocalStream(stream);
    setIsSelectUsersViewDisplayed(false)

    clearCall();
  };

  function _onPressReject() {
    CallService.rejectCall(_session.current);
    clearCall();
  };

  // callbacks

  async function _onCallListener(session, extension){
    try {
      await CallService.processOnCallListener(session)

      _session.current = session;
 
      setIsIncomingCall(true)
    } catch (e) {
      clearCall()
    }
  };

  async function _onAcceptCallListener(session, userId, extension){
    try {
      await CallService.processOnAcceptCallListener(session, userId, extension)
     
      showToast(`${getUserById(userId, 'name')} has accepted the call`);

      setIsActiveCall(true)
    } catch (e) {
      showToast('You have accepted the call on other side');

      clearCall()
    }
  };

  async function _onRejectCallListener(session, userId, extension){
    try {
      await CallService.processOnRejectCallListener(session, userId, extension)

      removeRemoteStream(userId)

      const userName = getUserById(userId, 'name');
      const message = extension.busy
        ? `${userName} is busy`
        : `${userName} rejected the call request`;

      showToast(message);
    } catch (e) {
      showToast('You have rejected the call on other side');

      clearCall()
    }
  };

  async function _onStopCallListener (session, userId, extension){
    const isStoppedByInitiator = session.initiatorID === userId;
   
    try {
      await CallService.processOnStopCallListener()

      const userName = getUserById(userId, 'name');
      const message = `${userName} has ${isStoppedByInitiator ? 'stopped' : 'left'} the call`;

      showToast(message);

      if (isStoppedByInitiator) {
        resetState();
      } else {
        removeRemoteStream(userId);
      }
    } catch (e) {
      clearCall()
    }
  };

  async function _onUserNotAnswerListener(session, userId){
    try {
      await CallService.processOnUserNotAnswerListener(userId)

      showToast(`${getUserById(userId, 'name')} did not answer`);

      removeRemoteStream(userId)
    } catch (e) {
      clearCall()
    }
  };

  async function _onRemoteStreamListener(session, userId, stream){
    try {
      await CallService.processOnRemoteStreamListener(userId)
      
      updateRemoteStream(userId, stream);
      
      setIsActiveCall(true)
    } catch (e) {
      clearCall()
    }
  };

  const initiatorName = isIncomingCall
    ? getUserById(_session.current.initiatorID, 'name')
    : '';
  const localStreamItem = localStream
    ? [{userId: 'localStream', stream: localStream}]
    : [];
  const streams = [...remoteStreams, ...localStreamItem];

  CallService.setSpeakerphoneOn(remoteStreams.length > 0);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
      <StatusBar backgroundColor="black" barStyle="light-content" />

    </SafeAreaView>
  );
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  },[value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}