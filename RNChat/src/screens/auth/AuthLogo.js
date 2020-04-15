import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

const AuthLogo = () => (
  <View style={styles.container}>
    <Image style={styles.imageSize} source={require('../../../assets/image/logo_with_text.png')} />
  </View>
);

export default AuthLogo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  imageSize: {
    width: 200,
    height: 150,
  },
});
