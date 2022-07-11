import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';
import { useSelector } from 'react-redux'

import VideoGrid from '../generic/video-grid';
import CallService from '../../services/call-service';
import VideoToolBar from '../generic/video-toolbar';
import { showToast } from '../../utils'

export default function VideoScreen ({ navigation }) {
  const streams = useSelector(store => store.activeCall.streams);
  const callSession = useSelector(store => store.activeCall.session);

  useEffect(() => {
    // stop call if all opponents are left
    if (streams.length === 1) {
      stopCall()
    }
  }, [streams]);

  function navigateBack() {
    navigation.pop();

    showToast("Call is ended")
  }

  function stopCall(){
    CallService.stopCall(callSession.ID);

    navigateBack()
  }

  function muteCall(isAudioMuted) {
    CallService.muteMicrophone(isAudioMuted);
  }

  function switchCamera() {
    CallService.switchCamera();
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <VideoGrid streams={streams} />
      <VideoToolBar
        onSwitchCamera={switchCamera}
        onStopCall={stopCall}
        onMute={muteCall}
        canSwitchCamera={CallService.mediaDevices.length > 1}
      />
    </SafeAreaView>
  );
}