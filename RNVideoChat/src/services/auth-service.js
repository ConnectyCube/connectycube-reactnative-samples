import { ConnectyCube, initConnectyCube } from '@connectycube/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { credentials, appConfig } from '../config';
import store, { resetStore } from '../redux/store';
import { setCurrentUser } from '../redux/slices/currentUser';
import { setIsLogging } from '../redux/slices/isLogging';
import { PushService } from '.';

class AuthService {
  constructor() {
    if (AuthService.instance) {
      return AuthService.instance;
    }

    AuthService.instance = this;
  }

  init() {
    initConnectyCube(credentials, appConfig);
  }

  async login(user) {
    store.dispatch(setIsLogging(true));
    await ConnectyCube.createSession(user);
    await PushService.register();
    await this.setUserToAsyncStorage(user);
    await ConnectyCube.chat.connect({
      userId: user.id,
      password: user.password,
    });
    store.dispatch(setCurrentUser(user));
    store.dispatch(setIsLogging(false));

    return user;
  }

  async autoLogin() {
    const user = await this.getUserFromAsyncStorage();

    if (user) {
      await this.login(user);
    }

    return user;
  }

  async logout() {
    await ConnectyCube.chat.disconnect();
    await ConnectyCube.destroySession();
    await this.removeUserFromAsyncStorage();
    resetStore();
  }

  async setUserToAsyncStorage(user) {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem('@currentUser', jsonValue);
    } catch (e) {
      console.error('[AsyncStorage] setUserToAsyncStorage error: ', e);
    }
  }

  async removeUserFromAsyncStorage() {
    try {
      await AsyncStorage.removeItem('@currentUser');
    } catch (e) {
      console.error('[AsyncStorage] removeUserFromAsyncStorage error: ', e);
    }
  }

  async getUserFromAsyncStorage() {
    try {
      const jsonValue = await AsyncStorage.getItem('@currentUser');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('[AsyncStorage] getUserFromAsyncStorage error: ', e);
    }
  }
}

export default new AuthService();
