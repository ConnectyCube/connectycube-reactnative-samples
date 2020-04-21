import React, { useEffect, useContext } from 'react';
import { StyleSheet, View, Image } from 'react-native';

import AuthContext from '../services/auth-service';

const AppWrap = ({ navigation }) => {
  const AuthService = useContext(AuthContext);

  useEffect(() => {
    initUser();
  }, []);

  useEffect(() => {
    if (AuthService.currentUser) {
      navigation.navigate('Dialogs', { currentUser: AuthService.currentUser });
    }
  }, [AuthService.currentUser]);

  const initUser = async () => {
    const rootStackScreen = await AuthService.init();
    if (rootStackScreen !== 'Dialogs') {
      navigation.navigate(rootStackScreen);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.imageSize} source={require('../../assets/image/logo_with_text.png')} />
    </View>
  );
};

export default AppWrap;

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
