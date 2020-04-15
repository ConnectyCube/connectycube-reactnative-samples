import React, { Component } from 'react';
import { KeyboardAvoidingView, StatusBar, Platform } from 'react-native';
import { Header } from 'react-navigation-stack';

import AuthLogo from './AuthLogo';
import AuthForm from './AuthForm';
import AuthLinks from './AuthLinks';
import { STATUS_BAR_COLOR } from '../../helpers/constants';

class Auth extends Component {
  state = {
    isLogin: true,
  }

  toggleAuthState = () => {
    const { isLogin } = this.state;
    this.setState({ isLogin: !isLogin });
  }

  render() {
    const { isLogin } = this.state;
    const { navigation } = this.props;
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
          toggleAuthState={this.toggleAuthState}
          isLogin={isLogin}
        />
      </KeyboardAvoidingView>
    );
  }
}

export default Auth;
