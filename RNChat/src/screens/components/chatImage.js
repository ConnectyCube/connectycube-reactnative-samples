import React from 'react'
import { Image } from 'react-native'
import FastImage from 'react-native-fast-image'
import { getCbToken } from '../../helpers/file'

export default function ChatImage ({ photo, width, height }) {
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


