import React, { useEffect, useMemo } from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAspectRatioSize, ResumableZoom } from 'react-native-zoom-toolkit';

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
  const { width } = useWindowDimensions();
  const imageSize = getAspectRatioSize({
    aspectRatio: +attachment.width / +attachment.height,
    width: width,
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
    <>
      <ResumableZoom onSwipe={onHandleSwipe}>
        <Image source={source} style={imageSize} resizeMethod="scale" />
      </ResumableZoom>
    </>
  );
}
