import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthService, CallService, PushNotificationsService, CallKeepService } from '../../services';
import { users } from '../../config';
import store from '../../redux/store';
import { setCurrentUser } from '../../redux/slices/currentUser';

const logoSrc = require('../../../assets/image/logo.png');

export default function LoginScreen() {
  const navigation = useNavigation();
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    AuthService.getStoredUser().then(storedUser => {
      if (storedUser) {
        login(storedUser);
      }
    });
  }, []);

  async function login(user) {
    setIsLogging(true);

    await AuthService.login(user);
    store.dispatch(setCurrentUser(user));

    CallService.registerEvents();
    PushNotificationsService.register();

    setIsLogging(false);

    const opponents = users.filter(opponent => opponent.id !== user.id);
    navigation.push('InitiateCallScreen', { opponents });
  }

  return (
    <SafeAreaView style={[styles.container, styles.f1]}>
      <View style={[styles.centeredChildren, styles.f1]}>
        <View style={[styles.f1, styles.centeredChildren]}>
          <Image resizeMode="contain" source={logoSrc} style={styles.logoImg} />
          <Text style={styles.heading}>
            CONNECTYCUBE
          </Text>
        </View>
        <View
          style={[
            styles.f1,
            styles.centeredChildren,
            styles.flexRow,
          ]}>
          <Text style={styles.title}>
            {isLogging ? 'Connecting... ' : 'P2P Video Chat'}
          </Text>
          {isLogging && <ActivityIndicator size="small" color="#1198d4" />}
        </View>
      </View>
      <View style={[styles.authButtons, styles.f1]}>
        {users.map((user) => (
          <TouchableOpacity key={user.id} onPress={() => login(user)}>
            <View style={[styles.authBtn(user.color), styles.centeredChildren]}>
              <Text style={styles.authBtnText}>{`Log in as ${user.full_name}`}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
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
  flexRow: {
    flexDirection: 'row',
  },
  container: {
    backgroundColor: 'black',
  },
  logoImg: {
    marginTop: 30,
    marginBottom: 15,
    width: 120,
    height: 120,
  },
  heading: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
  },
  title: {
    color: 'white',
  },
  authButtons: {
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  authBtn: (backgroundColor) => ({
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
