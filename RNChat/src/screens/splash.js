import React, { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { AuthService } from '../services';

export default function Splash() {
  const initSDK = async () => {
    await AuthService.init();
  };

  useEffect(() => {
    initSDK();
  }, []);

  return (
    <View style={styles.container}>
      <Image style={styles.imageSize} source={require('../../assets/image/splash.png')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSize: {
    width: 200,
    height: 150,
  },
});
