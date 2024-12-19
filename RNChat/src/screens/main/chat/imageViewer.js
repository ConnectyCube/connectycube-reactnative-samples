import React, { useEffect, useMemo } from 'react';
import { Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAspectRatioSize, ResumableZoom } from 'react-native-zoom-toolkit';
import { SIZE_SCREEN } from '../../../helpers/constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function ImageViewer() {
  const navigation = useNavigation();
  const route = useRoute();
  const attachment = route.params?.attachment ?? {};
  const headerTitle = useMemo(() =>
    attachment.name <= 18
      ? attachment.name
      : `${attachment.name.slice(0, 9)}...${attachment.name.slice(-9)}`,
    [attachment.name]);
  const source = { uri: attachment.url };
  const imageSize = getAspectRatioSize({
    aspectRatio: +attachment.width / +attachment.height,
    width: SIZE_SCREEN.width,
  });

  useEffect(() => {
    navigation.setOptions({ headerTitle });
  }, [navigation, headerTitle]);

  const onHandleSwipe = direction => {
    if (direction === 'up' || direction === 'down') {
      navigation.goBack();
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ResumableZoom onSwipe={onHandleSwipe}>
        <Image source={source} style={imageSize} resizeMethod="scale" />
      </ResumableZoom>
    </GestureHandlerRootView>
  );
}
