import React from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import {connect} from 'react-redux';
import ToolBar from './ToolBar';
import CallingLoader from './CallingLoader';

export class VideoScreen extends React.Component {
  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'black'}}>
        <StatusBar backgroundColor="black" barStyle="light-content" animated />
        <View removeClippedSubviews style={{flex: 1, overflow: 'hidden'}}>
          {this.props.videoStreamsDataSource.map((item, i, arr) => (
            <RTCView
              objectFit="cover"
              style={styles.videoView}
              key={item.userId}
              streamURL={item.stream.toURL()}
            />
          ))}
        </View>
        <CallingLoader />
        <ToolBar />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  videoView: {
    flex: 1,
    backgroundColor: 'black',
  },
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

export default connect(mapStateToProps)(VideoScreen);
