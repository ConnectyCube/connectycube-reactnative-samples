import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Image,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthService } from '../../services';
import { users } from '../../config';

const logoSrc = require('../../../assets/logo.png');

const AuthScreen = () => {
  const navigation = useNavigation();
  const [isLogging, setIsLogging] = React.useState(false);

  const login = (currentUser) => {
    const _onSuccessLogin = () => {
      const opponentsIds = users
        .filter((opponent) => opponent.id !== currentUser.id)
        .map((opponent) => opponent.id);

      navigation.push('VideoScreen', { opponentsIds });
    };

    const _onFailLogin = (error = {}) => {
      alert(`Error.\n\n${JSON.stringify(error)}`);
    };

    setIsLogging(true);

    AuthService.login(currentUser)
      .then(_onSuccessLogin)
      .catch(_onFailLogin)
      .then(() => setIsLogging(false));
  };

  return (
    <View style={[styles.container, styles.f1]}>
      <SafeAreaView style={[styles.centeredChildren, styles.f1]}>
        <Image resizeMode="contain" source={logoSrc} style={styles.logoImg} />
        <View
          style={[
            styles.f1,
            styles.centeredChildren,
            { flexDirection: 'row' },
          ]}>
          <Text style={styles.title}>
            {isLogging ? 'Connecting... ' : 'Video Chat Conf'}
          </Text>
          {isLogging && <ActivityIndicator size="small" color="#1198d4" />}
        </View>
      </SafeAreaView>
      <SafeAreaView style={[styles.authBtns, styles.f1]}>
        {users.map((user) => (
          <TouchableOpacity key={user.id} onPress={() => login(user)}>
            <View style={[styles.authBtn(user.color), styles.centeredChildren]}>
              <Text style={styles.authBtnText}>{`Log in as ${user.name}`}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    </View>
  );
};

export default AuthScreen;

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
  title: {
    color: 'black',
  },
  authBtns: {
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
