import React from 'react';
import {
  NativeModules,
  Platform,
  StyleSheet,
  findNodeHandle,
  TouchableOpacity,
} from 'react-native';
import { ScreenCapturePickerView } from 'react-native-webrtc';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { ScreenShare, ScreenShareOff } from 'lucide-react-native';
import CallService from '../../services/call-service';

const isAndroid = Platform.OS === 'android';
const isIOS = Platform.OS === 'ios';

const ShareScreenButton = ({
  visible = false,
  isSharedScreen = false,
  setIsSharedScreen = () => null,
  setLocalStream = () => null,
}) => {
  const screenCaptureView = React.useRef(null);

  const startShareScreen = React.useCallback(async () => {
    try {
      if (isAndroid) {
        const channelId = await notifee.createChannel({
          id: 'screen_capture',
          name: 'Screen Capture',
          lights: false,
          vibration: false,
          importance: AndroidImportance.DEFAULT,
        });

        await notifee.displayNotification({
          title: 'Screen Capture',
          body: 'Capturing...',
          android: {
            channelId,
            asForegroundService: true,
          },
        });
      }

      if (isIOS) {
        const reactTag = findNodeHandle(screenCaptureView.current);
        await NativeModules.ScreenCapturePickerViewManager.show(reactTag);
      }

      await CallService.getDisplayMedia();
      setLocalStream('Capturing...');
      setIsSharedScreen(true);
    } catch (startShareScreenError) {
      console.error({ startShareScreenError });
    }
  }, [setLocalStream, setIsSharedScreen]);

  const stopShareScreen = React.useCallback(async () => {
    try {
      if (isAndroid) {
        await notifee.stopForegroundService();
      }

      const userMediaStream = await CallService.getUserMedia();

      setLocalStream(userMediaStream);
      setIsSharedScreen(false);
    } catch (stopShareScreenError) {
      console.error({ stopShareScreenError });
    }
  }, [setLocalStream, setIsSharedScreen]);

  const shareScreen = React.useCallback(async () => {
    if (isSharedScreen) {
      await stopShareScreen();
    } else {
      await startShareScreen();
    }
  }, [isSharedScreen, startShareScreen, stopShareScreen]);

  const ScreenShareIcon = React.useMemo(() => isSharedScreen ? ScreenShareOff : ScreenShare, [isSharedScreen]);

  return visible ? (
    <>
      <TouchableOpacity style={styles.container} onPress={shareScreen}>
        <ScreenShareIcon size={32} color="white" />
      </TouchableOpacity>
      {isIOS && (
        <ScreenCapturePickerView
          ref={screenCaptureView}
          style={styles.screenCapturePickerView}
        />
      )}
    </>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginHorizontal: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'purple',
  },
  screenCapturePickerView: {
    height: 0,
    width: 0,
  },
});

export default ShareScreenButton;
