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
import { AuthService, PushNotificationsService, CallKitService } from '../../services';
import { users } from '../../config';

export default class AuthScreen extends PureComponent {
  state = {isLogging: false, user: null};

  setIsLogging = isLogging => this.setState({ isLogging });
  setUser = user => this.setState({ user });

  login = user => {
    console.log("[AuthScreen][login] user", user);

    this.setIsLogging(true);
    this.setUser(user)

    AuthService.login(user)
      .then(this._onSuccessLogin)
      .catch(this._onFailLogin)
      .then(() => this.setIsLogging(false));
  };

  _onSuccessLogin = () => {
    // init push notifications service and subscribe for push notifications
    this._initPushNotificationsAndSubscribe()

    this._initCallKit()

    const { navigation } = this.props;
    const opponents = users.filter(opponent => opponent.id !== this.state.user.id)

    navigation.push('VideoScreen', { opponents, currentUser: this.state.user });
  };

  _onFailLogin = (error = {}) => {
    console.error("[AuthScreen][_onFailLogin] error", error);

    alert(`Error.\n\n${JSON.stringify(error)}`);
  };

  _initPushNotificationsAndSubscribe() {
    PushNotificationsService.init();

    if (Platform.OS === 'ios') {
      PushNotificationsService.initVoIP();
    }
  }

  _initCallKit() {
    CallKitService.init();
  }


  render() {
    const { isLogging } = this.state;
    const logoSrc = require('../../../assets/logo.png');

    console.log("isLogging", isLogging)

    return (
      <View style={[styles.container, styles.f1]}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <SafeAreaView style={[styles.centeredChildren, styles.f1]}>
          <Image resizeMode="contain" source={logoSrc} style={styles.logoImg} />
          <View
            style={[
              styles.f1,
              styles.centeredChildren,
              {flexDirection: 'row'},
            ]}>
            <Text style={styles.logoText}>{isLogging ? 'Connecting... ' : 'P2P Video Chat'}</Text>
            {isLogging && <ActivityIndicator size="small" color="#1198d4" />}
          </View>
        </SafeAreaView>
        <SafeAreaView style={[styles.authBtns, styles.f1]}>
          {users.map(user => (
            <TouchableOpacity key={user.id} onPress={() => this.login(user)}>
              <View
                style={[styles.authBtn(user.color), styles.centeredChildren]}>
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
  logoText: {
    fontSize: 30
  },
  authBtns: {
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  authBtn: backgroundColor => ({
    backgroundColor,
    height: 50,
    borderRadius: 25,
    marginHorizontal: 25,
    marginVertical: 5,
  }),
  authBtnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});
