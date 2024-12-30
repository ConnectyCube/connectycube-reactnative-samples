import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { CallService } from '../../services';
import CallingLoader from './CallingLoader';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const RTCViewRendered = ({ userId, stream }) => {
  const navigation = useNavigation();

  const userName = React.useMemo(
    () =>
      userId === 'localStream'
        ? 'Self video'
        : CallService.getUserById(userId, 'full_name') ?? 'Unknown',
    [userId],
  );

  const openFullScreen = React.useCallback(() => {
    navigation.navigate('FullScreenModal', { stream, userId, userName });
  }, [stream, userId, userName, navigation]);

  return stream && stream._tracks ? (
    <View style={styles.blackView}>
      <RTCView
        mirror={userId === 'localStream'}
        objectFit="cover"
        style={styles.blackView}
        streamURL={stream.toURL()}
        key={`stream:${userId}`}
        zOrder={1}
      />
      <TouchableOpacity style={styles.fullScreen} onPress={openFullScreen}>
        <MaterialIcon name={'fullscreen'} size={30} color="white" />
      </TouchableOpacity>
    </View>
  ) : (
    <View style={styles.blackView}>
      {typeof stream === 'string' ? (
        <CallingLoader name={stream} />
      ) : (
        <CallingLoader name={userName} />
      )}
    </View>
  );
};

const RTCViewGrid = ({ streams }) => {
  switch (streams.length) {
    case 1:
      return (
        <View style={styles.blackView}>
          <RTCViewRendered
            userId={streams[0].userId}
            stream={streams[0].stream}
          />
        </View>
      );

    case 2:
      return (
        <View style={styles.blackView}>
          <View style={styles.inColumn}>
            <RTCViewRendered
              userId={streams[0].userId}
              stream={streams[0].stream}
            />
            <RTCViewRendered
              userId={streams[1].userId}
              stream={streams[1].stream}
            />
          </View>
        </View>
      );

    case 3:
      return (
        <View style={styles.blackView}>
          <View style={styles.inColumn}>
            <View style={styles.inRow}>
              <RTCViewRendered
                userId={streams[0].userId}
                stream={streams[0].stream}
              />
              <RTCViewRendered
                userId={streams[1].userId}
                stream={streams[1].stream}
              />
            </View>
            <RTCViewRendered
              userId={streams[2].userId}
              stream={streams[2].stream}
            />
          </View>
        </View>
      );

    case 4:
      return (
        <View style={styles.blackView}>
          <View style={styles.inColumn}>
            <View style={styles.inRow}>
              <RTCViewRendered
                userId={streams[0].userId}
                stream={streams[0].stream}
              />
              <RTCViewRendered
                userId={streams[1].userId}
                stream={streams[1].stream}
              />
            </View>
            <View style={styles.inRow}>
              <RTCViewRendered
                userId={streams[2].userId}
                stream={streams[2].stream}
              />
              <RTCViewRendered
                userId={streams[3].userId}
                stream={streams[3].stream}
              />
            </View>
          </View>
        </View>
      );

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  blackView: {
    flex: 1,
    backgroundColor: 'black',
  },
  inColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  inRow: {
    flex: 1,
    flexDirection: 'row',
  },
  fullScreen: {
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default RTCViewGrid;
