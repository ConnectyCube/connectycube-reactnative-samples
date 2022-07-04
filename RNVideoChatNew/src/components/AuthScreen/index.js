import React, {useState} from 'react';
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
import { users } from '../../config-users';

const logoSrc = require('../../../assets/logo.png');

export default function AuthScreen({navigation}){

  const [isLogging, setIsLogging] = useState(false);

  async function login(user){
    console.log("Login", user);

    setIsLogging(true);

    try {
      await AuthService.login(user)

      _initPushNotificationsAndSubscribe()

      // CallKitService.init();

      const opponents = users.filter(opponent => opponent.id !== user.id)

      navigation.push('VideoScreen', { opponents, currentUser: user });

    } catch (e) {
      alert(`Error.\n\n${JSON.stringify(error)}`);
    }
  };

  function _initPushNotificationsAndSubscribe() {
    PushNotificationsService.init();

    // if (Platform.OS === 'ios') {
    //   PushNotificationsService.initVoIP();
    // }
  }

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
          <Text style={styles.logoText}>{isLogging ? '' : 'P2P Video Chat'}</Text>
          {isLogging && <ActivityIndicator size="small" color="#1198d4" />}
        </View>
      </SafeAreaView>
      <SafeAreaView style={[styles.authBtns, styles.f1]}>
        {users.map(user => (
          <TouchableOpacity key={user.id} onPress={() => login(user)}>
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
    fontSize: 30,
    color: 'black'
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
