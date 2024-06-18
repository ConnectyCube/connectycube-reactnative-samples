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
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { CallService } from '../../services';

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

  return visible ? (
    <>
      <TouchableOpacity style={styles.container} onPress={shareScreen}>
        <MaterialIcon
          name={isSharedScreen ? 'stop-screen-share' : 'screen-share'}
          size={32}
          color="white"
        />
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
    display: 'none',
  },
});

export default ShareScreenButton;
