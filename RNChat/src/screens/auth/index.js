import React, { useState } from 'react';
import { KeyboardAvoidingView, StatusBar, Platform } from 'react-native';
import { Header } from 'react-navigation-stack';

import AuthLogo from './AuthLogo';
import AuthForm from './AuthForm';
import AuthLinks from './AuthLinks';

const Auth = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthState = () => {
    setIsLogin(!isLogin);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? Header.HEIGHT + 20 : 0}
    >
      <StatusBar barStyle="dark-content" />
      <AuthLogo />
      <AuthForm
        navigation={navigation}
        isLogin={isLogin}
      />
      <AuthLinks
        toggleAuthState={toggleAuthState}
        isLogin={isLogin}
      />
    </KeyboardAvoidingView>
  );
};

export default Auth;
