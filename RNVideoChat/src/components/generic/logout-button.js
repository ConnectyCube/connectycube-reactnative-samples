import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={styles.text}>Logout</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    color: 'white',
  },
});
