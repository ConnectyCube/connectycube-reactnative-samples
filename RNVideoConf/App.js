import React from 'react';
import {
  StyleSheet,
  View,
  PermissionsAndroid
} from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import {RTCView} from 'react-native-webrtc';

const CUBE_CONFIG = [
  {
    appId: 385,
    authKey: 'DFBMs5-dKBBCXcd',
    authSecret: 'SkCW-ThdnmRg9Za',
  },
  {
    debug: {mode: 1},
  },
]

class App extends React.PureComponent {

  state = {
    localStream: void 0
  }

  _prepareLocalStream = async () => {
    ConnectyCube.init(...CUBE_CONFIG)
    await ConnectyCube.createSession()
    const session = ConnectyCube.videochatconference.createNewSession()
    // await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS])
    const localStream = await session.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minWidth: 500, // Provide your own width, height and frame rate here
          minHeight: 300,
          minFrameRate: 30
        },
        facingMode: 'user'
      }
    })
    this.setState({ localStream })
  }

  componentDidMount() {
    this._prepareLocalStream()
  }

  render() {
    const { localStream } = this.state
    return (
      <View style={styles.full}>
        {
          localStream && (
            <RTCView
              objectFit="cover"
              style={styles.full}
              streamURL={localStream.toURL()}
            />
          )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  full: {
    flex: 1
  }
});

export default App;
