import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';

import { showAlert } from '../../helpers/alert';
import AuthService from '../../services/auth-service';
import Indicator from '../components/indicator';
import ChatService from '../../services/chat-service';

const AuthForm = ({ isLogin, navigation }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoader, setIsLoader] = useState(false);

  useEffect(() => {
    setName('');
    setPassword('');
  }, [isLogin]);

  const login = async () => {
    const dataUser = { full_name: name, login: name, password };

    Keyboard.dismiss();

    if (!name.trim() || !password.trim()) {
      const endMessage = isLogin ? 'login.' : 'sign up';
      showAlert(`Warning.\n\nFill the fields to ${endMessage}`);
      return;
    }

    setIsLoader(true);

    if (isLogin) {
      try {
        await AuthService.signIn(dataUser);
        ChatService.setUpListeners();
        setIsLoader(false);
        navigation.navigate('Dialogs');
      } catch (error) {
        setIsLoader(false);
        showAlert(`Error.\n\n${JSON.stringify(error)}`);
      }
    } else {
      try {
        await AuthService.signUp(dataUser);
        setIsLoader(false);
        ChatService.setUpListeners();
        showAlert('Account successfully registered');
        navigation.navigate('Dialogs');
      } catch (error) {
        setIsLoader(false);
        showAlert(`Error.\n\n${JSON.stringify(error)}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      {isLoader && (
        <Indicator color="green" size={40} />
      )}
      <TextInput
        placeholder="Login"
        placeholderTextColor="grey"
        returnKeyType="next"
        // onSubmitEditing={() => this.emailInput.focus()}
        onChangeText={text => setName(text)}
        value={name}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="grey"
        secureTextEntry
        autoCapitalize="none"
        returnKeyType="done"
        onChangeText={text => setPassword(text)}
        value={password}
        style={styles.input}
      />
      <TouchableOpacity onPress={login}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonLabel}>{isLogin ? 'Log in' : 'Sign up'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default AuthForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  input: {
    height: 50,
    color: 'black',
    borderRadius: 25,
    marginVertical: 5,
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    fontSize: 18,
  },
  buttonContainer: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00e3cf',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});
