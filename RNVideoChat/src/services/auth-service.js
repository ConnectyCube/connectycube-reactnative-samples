import ConnectyCube from 'react-native-connectycube';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  constructor() {
    if (AuthService.instance) {
      return AuthService.instance;
    }

    AuthService.instance = this;
  }

  async login(user) {
    await ConnectyCube.createSession(user);
    await ConnectyCube.chat.connect({
      userId: user.id,
      password: user.password,
    });
    await this._storeUser(user);
  }

  async logout() {
    ConnectyCube.chat.disconnect();
    await ConnectyCube.destroySession();

    await this._removeStoredUser();
  }

  async _storeUser(user) {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem('@currentUser', jsonValue);
    } catch (e) {
      console.error('_storeUser error: ', e);
    }
  }

  async _removeStoredUser() {
    try {
      await AsyncStorage.removeItem('@currentUser');
    } catch (e) {
      console.error('_removeStoredUser error: ', e);
    }
  }

  async getStoredUser() {
    try {
      const jsonValue = await AsyncStorage.getItem('@currentUser');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('_getStoredUser error: ', e);
    }
  }
}

export default new AuthService();
