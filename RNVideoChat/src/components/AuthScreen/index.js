import React, {PureComponent} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  StatusBar,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {AuthService} from '../../services';
import {users} from '../../config';

export default class AuthScreen extends PureComponent {
  state = {isLogging: false};

  setIsLogging = isLogging => this.setState({isLogging});

  login = currentUser => {
    const _onSuccessLogin = () => {
      const {navigation} = this.props;
      const opponentsIds = users
        .filter(opponent => opponent.id !== currentUser.id)
        .map(opponent => opponent.id);

      navigation.push('VideoScreen', {opponentsIds});
    };

    const _onFailLogin = () => {
      alert(`Error.\n\n${JSON.stringify(error)}`);
    };

    this.setIsLogging(true);

    AuthService.login(currentUser)
      .then(_onSuccessLogin)
      .catch(_onFailLogin)
      .then(() => this.setIsLogging(false));
  };

  render() {
    const {isLogging} = this.state;
    const logoSrc = require('../../../assets/logo.png');

    return (
      <View style={[styles.container, styles.f1]}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <SafeAreaView style={[styles.centeredChildren, styles.f1]}>
          <Image resizeMode="contain" source={logoSrc} style={styles.logoImg} />
          <Text style={styles.f1}>
            {isLogging ? 'Connecting...' : 'Video Chat'}
          </Text>
        </SafeAreaView>
        <View style={[styles.centeredChildren, styles.f1]}>
          {isLogging && <ActivityIndicator size="large" color="blue" />}
        </View>
        <SafeAreaView style={[styles.authBtns, styles.f1]}>
          {users.map(user => (
            <TouchableOpacity key={user.id} onPress={() => this.login(user)}>
              <View style={[styles.authBtn, styles.centeredChildren]}>
                <Text style={styles.authBtnText}>
                  {`Log in as ${user.name}`}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  f1: {
    flex: 1,
  },
  centeredChildren: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
  },
  logoImg: {
    width: '90%',
    height: '80%',
  },
  authBtns: {
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  authBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00e3cf',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  authBtnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});
