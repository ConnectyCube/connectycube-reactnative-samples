# File upload code sample for React Native for ConnectyCube platform

This README introduces a code sample for [ConnectyCube platform](https://connectycube.com) on how to upload files from React Native to ConnectyCube Storage cloud.

Project contains the following features implemented:

* User login to ConnectyCube platform
* Possibility to make photo via device camera
* Possibility to pick images from device gallery
* Upload the chosen image file to ConnectyCube Storage cloud

## Quick review

Install Expo Client application from [App Store](https://itunes.apple.com/app/apple-store/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=ru) and follow by link to project published at Expo - [RNUploadFiles](https://expo.io/@ccvlad/RNUploadFiles)

## Quick start and develop

[Quick start React Native app](https://docs.nativescript.org/start/quick-setup/): install `npm install -g expo-cli` and run `npm start` from the root of this folder.

## How to build iOS/Android project

Install `npm install -g expo-cli` if did not it before and run `npm eject` from the root of this folder.

Read more about [Expo](https://docs.expo.io/versions/latest/expokit/eject#3-eject) and about [React Native getting started guide](https://facebook.github.io/react-native/docs/getting-started).

## Upload file to ConnectyCube storage without using Expo SDK

Possible to use [React Native Image Crop Picker](https://github.com/ivpusic/react-native-image-crop-picker) or [React Native Image Picker](https://github.com/react-native-community/react-native-image-picker)

```javascript
import React from 'react'
import ConnectyCube from 'connectycube-reactnative'
import { View, Button, Image } from 'react-native'
import ImagePicker from 'react-native-image-crop-picker';

const auth = { appId: 0, authKey: '...', authSecret: '...', }
const conf = { debug: { mode: 1 } }
const user = { email: '...', password: '...' }

export default class App extends React.Component {
  state = { imageUri: null }

  componentWillMount() {
    ConnectyCube.init(auth, conf)

    ConnectyCube.createSession(user, (error, session) => {
      if (session) {
        console.log(error);
      } else {
        console.log(failSession)
      }
    })
  }

  pickImageAndUpload()
    // or ImagePicker.openPicker()
    ImagePicker.openCamera({
      cropping: true,
    }).then(image => {
      const data = {
        uri: image.path,
        size: image.size,
        name: image.path.split('/').pop(),
        type: image.mime
      }

      ConnectyCube.storage.createAndUpload({
        file: data,
        size: data.size,
        name: data.name,
        type: data.type,
        public: false
      }, (error, result) => {
        if (result) {
          const imageURL = ConnectyCube.storage.privateUrl(result.uid)
          // const imageURL = ConnectyCube.storage.publicUrl(result.uid) - if public = true

          this.setState({ imageUri: imageURL })
        } else {
          console.log(error)
        }
      })
    });
  }

  render() {
    const { imageUri } = this.state

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ marginBottom: 20 }}>
          <Button
            title="Pick from Camera and upload"
            onPress={() => this.pickImageAndUpload()}
          />
        </View>
        { imageUri &&
          <Image
            source={{ uri: imageUri }}
            style={{ width: 300, height: 300 }}
          />
        }
      </View>
    )
  }
}
```

## Can't build yourself?

Got troubles with building Cordova code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues) - we will create the sample for you. For FREE!
