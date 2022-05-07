import React, { useState } from 'react'
import { KeyboardAvoidingView, StatusBar, Platform } from 'react-native'
import { useHeaderHeight } from 'react-navigation-stack'
import AuthLogo from './AuthLogo'
import AuthForm from './AuthForm'
import AuthLinks from './AuthLinks'

export default function Auth({ navigation }) {

  const [isLogin, setIsLogin] = useState(false);

  const toggleAuthState = () => {
    setIsLogin(!isLogin)
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? useHeaderHeight() + 20 : 0}>
      <StatusBar barStyle={'dark-content'} />
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
  )
}