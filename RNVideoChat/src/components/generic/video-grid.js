import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-webrtc';

import Loader from './loader';
import { getUserById } from '../../utils';

const RTCViewRendered = ({ userId, stream }) => {
  return stream ? (
    <RTCView
      mirror={userId === 'localStream'}
      objectFit="cover"
      style={styles.blackView}
      key={userId}
      streamURL={stream.toURL()}
    />
  ) : (
    <View style={styles.blackView}>
      <Loader text={getUserById(userId, 'full_name')} />
    </View>
  );
};

export default ({ streams }) => {
  let RTCListView = null;

  switch (streams.length) {
    case 1:
      RTCListView = (
        <RTCViewRendered userId={streams[0].userId} stream={streams[0].stream} />
      );
      break;

    case 2:
      RTCListView = (
        <View style={styles.inColumn}>
          <RTCViewRendered userId={streams[0].userId} stream={streams[0].stream} />
          <RTCViewRendered userId={streams[1].userId} stream={streams[1].stream} />
        </View>
      );
      break;

    case 3:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <RTCViewRendered userId={streams[0].userId} stream={streams[0].stream} />
            <RTCViewRendered userId={streams[1].userId} stream={streams[1].stream} />
          </View>
          <RTCViewRendered userId={streams[2].userId} stream={streams[2].stream} />
        </View>
      );
      break;

    case 4:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <RTCViewRendered userId={streams[0].userId} stream={streams[0].stream} />
            <RTCViewRendered userId={streams[1].userId} stream={streams[1].stream} />
          </View>
          <View style={styles.inRow}>
            <RTCViewRendered userId={streams[2].userId} stream={streams[2].stream} />
            <RTCViewRendered userId={streams[3].userId} stream={streams[3].stream} />
          </View>
        </View>
      );
      break;

    default:
      break;
  }

  return <View style={styles.blackView}>{RTCListView}</View>;
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
});
