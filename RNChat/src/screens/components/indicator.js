import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SIZE_SCREEN } from '../../helpers/constants';

export default function Indicator({ color, size }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: SIZE_SCREEN.width,
    height: SIZE_SCREEN.height - 78,
    zIndex: 1000,
  },
});
