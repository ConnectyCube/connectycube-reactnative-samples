import React from 'react'
import { StyleSheet, View, Button, Image, Dimensions, Alert } from 'react-native'
import { ImagePicker, MediaLibrary, FileSystem, Permissions } from 'expo'
import ConnectyCube from 'connectycube-reactnative'

const cbConfig = [
	{
		appId: 218,
		authKey: 'p-cqm2aatn8ZPM3',
		authSecret: '3hmGuXN8AHZOgg6',
	},
	{
		debug: { mode: 1 },
	},
]

export default class App extends React.Component {
  state = {
    file: null,
  }

  componentWillMount() {
    ConnectyCube.init(...cbConfig)
    ConnectyCube.createSession((failSession, session) => {
      if (!failSession, session) {
        ConnectyCube.login({
          email: 'testfileupload@gmail.com',
          password: 'testfileupload'
        }, (failLogin, user) => {
          if (!failLogin && user) {
            console.log('Session was created. Success to login.');
          } else {
            alert(`\nFail to login.\n\n${JSON.stringify(failLogin, null, 2)}`);
          }
        })
      } else {
        alert(`\nFail to create ConnectyCube session.\n\n${JSON.stringify(failLogin, null, 2)}`);
      }
    })
  }

  getSize() {
    return {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height
    }
  }

  pickFileFrom = async (source) => {
    const permissions = source === 'camera' ? Permissions.CAMERA : Permissions.CAMERA_ROLL
    const { status } = await Permissions.askAsync(permissions);

    if (status === 'granted') {
      const { uri, type, cancelled } = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: 'Images' })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'Images' })
      const { filename } = await MediaLibrary.createAssetAsync(uri)
      const { size } = await FileSystem.getInfoAsync(uri)

      if (!cancelled) {
        this.setState({
          file: {
            uri,
            size,
            name: filename,
            type: `${type}/${uri.split('.').pop()}`
          }
        })

        console.log(this.state.file);
      }
    }
  }

  upload = async () => {
    const { file } = this.state

    ConnectyCube.storage.createAndUpload({
      file,
      ...file,
      public: false
    }, (error, result) => {
      if (!error) {
        alert(`\nFile uploaded successfully`);
      } else {
        alert(`\nFail to upload file.\n\n${JSON.stringify(error, null, 2)}`);
      }
    })
  }

  render() {
    let { file } = this.state

    return (
      <View style={styles.container}>
        <View style={styles.containerButtons}>
          <View style={styles.externalSpace}>
            <Button title="Pick from Camera" onPress={() => this.pickFileFrom('camera')}/>
          </View>
          <View style={styles.externalSpace}>
            <Button title="Pick from Gallery" onPress={() => this.pickFileFrom('gallery')}/>
          </View>
        </View>
          { file &&
            <Image source={{ uri: file.uri }} style={{ width: this.getSize().width, height: this.getSize().width }} />
          }
          { file &&
            <View style={styles.externalSpace}>
              <Button title="Upload" onPress={() => this.upload()} buttonStyle={{ backgroundColor: "transparent" }}/>
            </View>
          }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  externalSpace: {
    margin: 20
  }
})
