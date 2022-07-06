import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import { useSelector } from 'react-redux'

import VideoGrid from '../generic/video-grid';
import { CallService, AuthService, PushNotificationsService, CallKitService } from '../../services';
import VideoToolBar from '../generic/video-toolbar';
import { getUserById, uuidv4, showToast } from '../../utils'

export default function VideoScreen ({ route, navigation }) {
  const opponents = route.params.selectedOpponents;

  const currentUser = useSelector(store => store.currentUser);
  const streams = useSelector(store => store.activeCall.streams);

  // useEffect(() => {
  //   _startCall();

  //   return () => {
  //     CallService.stopCall();
  //     AuthService.logout();
  //   }
  // }, []);

  // useEffect(() => {
  //   // stop call if all opponents are left
  //   if (prevRemoteStreams?.length > 0 && remoteStreams.length === 0) {
  //     CallService.stopCall();
  //     resetState()
  //   }
  // }, [remoteStreams]);

  function navigateBack() {
    navigation.pop();

    showToast("Call is ended")
  }

  function stopCall(){
    CallService.stopCall();

    navigateBack()
  }

  function switchCamera() {
    CallService.switchCamera();
  };

  async function _onPressAccept(){
    const stream = await CallService.acceptCall(_session.current)

    const {opponentsIDs, initiatorID, currentUserID} = _session.current;
    const _oIds = [initiatorID, ...opponentsIDs].filter(
      userId => currentUserID !== userId,
    );

    initRemoteStreams(_oIds);
    setLocalStream(stream);
    // setIsSelectUsersViewDisplayed(false)

    clearCall();
  };

  // CallService.setSpeakerphoneOn(remoteStreams.length > 0);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <VideoGrid streams={streams} />
      <VideoToolBar
        switchCamera={switchCamera}
        stopCall={stopCall}
      />
    </SafeAreaView>
  );
}