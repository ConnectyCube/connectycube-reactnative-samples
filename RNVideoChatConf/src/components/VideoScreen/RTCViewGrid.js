import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-connectycube';
import { CallService } from '../../services';
import CallingLoader from './CallingLoader';

const RTCViewRendered = ({ userId, stream }) =>
  stream && stream._tracks ? (
    <View style={styles.blackView} key={`wrap:view:${userId}`}>
      <RTCView
        objectFit="cover"
        style={styles.blackView}
        streamURL={stream.toURL()}
        key={`rtc:view:${userId}`}
        zOrder={1}
      />
    </View>
  ) : (
    <View style={styles.blackView}>
      {typeof stream === 'string' ? (
        <CallingLoader name={stream} />
      ) : (
        <CallingLoader name={CallService.getUserById(userId, 'name')} />
      )}
    </View>
  );

export default ({ streams }) => {
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
});
