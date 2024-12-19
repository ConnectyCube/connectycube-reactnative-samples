import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const RTCViewFullScreenModal = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets();
  const stream = route?.params?.stream ?? null;
  const userId = route?.params?.userId ?? 0;
  const userName = route?.params?.userName ?? 'unknown';

  const exitFullScreen = React.useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  React.useEffect(() => {
    if (!stream) {
      exitFullScreen();
    }
  }, [stream, exitFullScreen]);

  return stream ? (
    <View style={styles.blackView}>
      <View style={styles.header(top)}>
        <View style={styles.placeholder} />
        <Text style={styles.userName}>{userName}</Text>
        <TouchableOpacity style={styles.button} onPress={exitFullScreen}>
          <MaterialIcon name="fullscreen-exit" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <RTCView
        mirror={userId === 'localStream'}
        objectFit="contain"
        style={styles.blackView}
        streamURL={stream.toURL()}
        key={`rtc:view:${userId}`}
        zOrder={1}
      />
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  blackView: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: (top = 0) => ({
    zIndex: 2,
    height: 40,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 0,
    top,
  }),
  placeholder: {
    height: 40,
    width: 40,
  },
  userName: {
    fontSize: 18,
    color: 'white',
  },
  button: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RTCViewFullScreenModal;
