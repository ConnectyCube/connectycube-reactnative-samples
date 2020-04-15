import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import { SIZE_SCREEN } from '../../helpers/constants';

const Indicator = ({ color, size }) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

export default Indicator;

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
