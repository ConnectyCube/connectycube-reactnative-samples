import React, { useState, useEffect, useContext } from 'react';
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
import { users } from '../../config';
import logoSrc from '../../../assets/logo.png';
import AuthContext from '../../services/auth-service';

const AuthScreen = ({ navigation }) => {
  const [isLogging, setIsLogging] = useState(false);
  const AuthService = useContext(AuthContext);

  useEffect(() => {
    AuthService.init();
  }, []);

  const login = async (currentUser) => {
    const _onSuccessLogin = () => {
      const opponentsIds = users
        .filter(opponent => opponent.id !== currentUser.id)
        .map(opponent => opponent.id);

      navigation.push('VideoScreen', { opponentsIds });
    };

    const _onFailLogin = (error = {}) => {
      alert(`Error.\n\n${JSON.stringify(error)}`);
    };

    setIsLogging(true);

    try {
      const result = await AuthService.login(currentUser);
      _onSuccessLogin(result);
    } catch (error) {
      _onFailLogin(error);
    }
    setIsLogging(false);
  };

  return (
    <View style={[styles.container, styles.f1]}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <SafeAreaView style={[styles.centeredChildren, styles.f1]}>
        <Image resizeMode="contain" source={logoSrc} style={styles.logoImg} />
        <View
          style={[
            styles.f1,
            styles.centeredChildren,
            { flexDirection: 'row' },
          ]}
        >
          <Text>
            {isLogging
              ? 'Connecting... '
              : 'Video Chat'}
          </Text>
          {isLogging && <ActivityIndicator size="small" color="#1198d4" />}
        </View>
      </SafeAreaView>
      <SafeAreaView style={[styles.authBtns, styles.f1]}>
        {users.map(user => (
          <TouchableOpacity key={user.id} onPress={async () => login(user)}>
            <View
              style={[styles.authBtn(user.color), styles.centeredChildren]}
            >
              <Text style={styles.authBtnText}>
                {`Log in as ${user.name}`}
              </Text>
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
