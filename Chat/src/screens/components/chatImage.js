import React, { Component } from 'react'
import { Image } from 'react-native'
import FastImage from 'react-native-fast-image'
import { getCbToken } from '../../helpers/file'

export default class ChatImage extends Component {

  render() {
    const { photo, width, height } = this.props
    let source = {}
    let localPath = false

    if (photo.startsWith('https://')) {
      localPath = false
      source = getCbToken(photo)
      source.priority = FastImage.priority.high
    } else {
      localPath = photo
    }

    return (localPath ?
      <Image
        style={{ width, height }}
        source={{ uri: localPath }}
      /> :
      <FastImage
        style={{ width, height }}
        source={source}
        key={photo}
      />
    )
  }

}


