import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SIZE_SCREEN } from '../../helpers/constants';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Indicator({ isActive }) {
  const headerHeight = useHeaderHeight();
  const { bottom } = useSafeAreaInsets();

  return isActive
    ? (
      <View style={styles.container(headerHeight + bottom)}>
        <ActivityIndicator size={40} color="blue" />
      </View>
    ) : null;
}

const styles = StyleSheet.create({
  container: (offset = 0) => ({
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZE_SCREEN.width,
    height: SIZE_SCREEN.height - offset,
    zIndex: 1000,
  }),
});
