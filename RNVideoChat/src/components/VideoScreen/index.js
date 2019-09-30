import React from 'react';
import {StyleSheet, View, StatusBar, Dimensions, Platform} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import {connect} from 'react-redux';
import ToolBar from './ToolBar';
import CallingLoader from './CallingLoader';

const [screenH, screenW] = [
  Dimensions.get('window').height,
  Dimensions.get('window').width,
];
export class VideoScreen extends React.Component {
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <StatusBar backgroundColor="black" barStyle="light-content" animated />
        <View removeClippedSubviews style={{flex: 1, overflow: 'hidden'}}>
          {this.props.videoStreamsDataSource.map((item, i, arr) => (
            <View style={styles.videoViewWrapper} key={i}>
              <RTCView
                objectFit="cover"
                style={styles.videoView(arr.length)}
                key={item.userId}
                streamURL={item.stream.toURL()}
              />
            </View>
          ))}
        </View>
        <CallingLoader />
        <ToolBar />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  videoViewWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  videoView: count =>
    Platform.select({
      ios: {
        // height: screenH,
        // width: screenW,
        // top: count === 2 ? -screenH / 4 : 0,
        // backgroundColor: 'black',
        flex: 1,
        backgroundColor: 'black',
      },
      android: {
        flex: 1,
        backgroundColor: 'black',
      },
    }),
});

const mapStateToProps = state => {
  // convert map to array
  let dataSource = [];

  Object.keys(state.videosession.videoStreams).map(userId => {
    dataSource.push({
      userId: userId,
      stream: state.videosession.videoStreams[userId],
    });
  });

  return {
    videoStreamsDataSource: dataSource,
  };
};

export default connect(
  mapStateToProps,
  null,
)(VideoScreen);
