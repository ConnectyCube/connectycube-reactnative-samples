import { useCallback, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { CallType } from '@connectycube/react';
import VideoGrid from '../generic/video-grid';
import { CallService } from '../../services';
import VideoToolBar from '../generic/video-toolbar';
import Loader from '../generic/loader';
import { StyleSheet } from 'react-native';

export default function VideoScreen() {
  const navigation = useNavigation();
  const streams = useSelector(state => state.activeCall.streams);
  const callSession = useSelector(state => state.activeCall.session);
  const isAccepted = useSelector(state => state.activeCall.isAccepted);
  const isEarlyAccepted = useSelector(state => state.activeCall.isEarlyAccepted);
  const isVideoCall = callSession?.callType === CallType.VIDEO;

  useEffect(() => {
    if (streams.length <= 1) {
      stopCall(); // stop call if all opponents are left
    }
  }, [streams, stopCall]);

  const stopCall = useCallback(() => {
    CallService.stopCall();
    navigation.goBack();
  }, [navigation]);

  const muteCall = (isAudioMuted) => {
    CallService.muteMicrophone(isAudioMuted);
  };

  const switchCamera = () => {
    CallService.switchCamera();
  };

  return (
    <SafeAreaView style={styles.container}>
      <VideoGrid streams={streams} />
      {isEarlyAccepted && isAccepted && <Loader text="connecting..." />}
      <VideoToolBar
        displaySwitchCam={isVideoCall}
        onSwitchCamera={switchCamera}
        onStopCall={stopCall}
        onMute={muteCall}
        canSwitchCamera={CallService.mediaDevices.length > 1}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
