import React, { useEffect, useMemo } from 'react';
import { Image, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { fitContainer, ResumableZoom, useImageResolution, } from 'react-native-zoom-toolkit';
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

  const onHandleSwipe = direction => {
    if (direction === 'up' || direction === 'down') {
      navigation.goBack();
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerTitle });
  }, [navigation, headerTitle]);

  const { width, height } = useWindowDimensions();
  const { isFetching, resolution } = useImageResolution(source);

  if (isFetching || resolution === undefined) {
    return null;
  }

  const size = fitContainer(resolution.width / resolution.height, {
    width,
    height,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ResumableZoom onSwipe={onHandleSwipe}>
        <Image source={source} style={{ ...size }} resizeMethod="scale" />
      </ResumableZoom>
    </GestureHandlerRootView>
  );
}
