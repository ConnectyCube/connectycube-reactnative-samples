import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthLogo from './AuthLogo';
import AuthForm from './AuthForm';
import AuthLinks from './AuthLinks';

export default function Auth() {
  const { bottom } = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(false);
  const toggleAuthState = () => {
    setIsLogin(!isLogin);
  };

  return (
    <KeyboardAvoidingView style={styles.wrap} behavior="padding" keyboardVerticalOffset={-bottom}>
      <>
        <AuthLogo />
        <AuthForm isLogin={isLogin} />
        <AuthLinks isLogin={isLogin} toggleAuthState={toggleAuthState} />
      </>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: 'white',
  },
});
