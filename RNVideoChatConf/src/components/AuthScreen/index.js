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
import Toast from 'react-native-simple-toast';
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
      Toast.show(`Error: "${JSON.stringify(error)}"`);
    };

    setIsLogging(true);

    AuthService.login(currentUser)
      .then(_onSuccessLogin)
      .catch(_onFailLogin)
      .then(() => setIsLogging(false));
  };

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
            {isLogging ? 'Connecting... ' : 'Video Chat Conference'}
          </Text>
          {isLogging && <ActivityIndicator size="small" color="#1198d4" />}
        </View>
      </View>
      <View style={[styles.authButtons, styles.f1]}>
        {users.map((user) => (
          <TouchableOpacity key={user.id} onPress={() => login(user)}>
            <View style={[styles.authBtn(user.color), styles.centeredChildren]}>
              <Text numberOfLines={1} style={styles.authBtnText}>{`Log in as ${user.full_name}`}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
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
    marginHorizontal: 20,
    marginVertical: 5,
  }),
  authBtnText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 10,
  },
});
