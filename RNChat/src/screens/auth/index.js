import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthLogo from './AuthLogo';
import AuthForm from './AuthForm';
import AuthLinks from './AuthLinks';
import { isAndroid } from '../../helpers/platform';

export default function Auth() {
  const { bottom } = useSafeAreaInsets();
  const kbOffset = isAndroid ? StatusBar.currentHeight : -bottom;
  const [isLogin, setIsLogin] = useState(false);
  const toggleAuthState = () => {
    setIsLogin(!isLogin);
  };

  return (
    <KeyboardAvoidingView style={styles.wrap} behavior="height" keyboardVerticalOffset={kbOffset}>
      <AuthLogo />
      <AuthForm isLogin={isLogin} />
      <AuthLinks isLogin={isLogin} toggleAuthState={toggleAuthState} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: 'white',
  },
});
