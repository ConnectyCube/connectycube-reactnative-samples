import React from 'react';
import { Image } from 'react-native';
import { getCbToken } from '../../helpers/file';

export default function ChatImage({ photo, width, height }) {
  const source = photo.startsWith('https://') ? getCbToken(photo) : { uri: photo };

  return <Image
    style={{ width, height }}
    source={source}
    key={photo}
  />;
}


