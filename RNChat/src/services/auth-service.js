import ConnectyCube from 'react-native-connectycube';
import { appCredentials, appConfig } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import User from '../models/user';
import store from '../redux/store';
import { resetStore } from '../redux/store';
import { setCurrentUser, updateCurrentUser } from '../redux/slices/currentUser';
import { setAppIsLoading } from '../redux/slices/app';
import { preparationUploadImg, getImageLinkFromUID } from '../helpers/file';
import ChatService from './chat-service';

class AuthService {
  static CURRENT_USER_SESSION_KEY = 'CURRENT_USER_SESSION_KEY';
  static DEVICE_SUBSCRIPTION_ID = 'DEVICE_SUBSCRIPTION_ID';

  constructor() {
    if (AuthService.instance) {
      return AuthService.instance;
    }

    AuthService.instance = this;
  }

  async init() {
    ConnectyCube.init(appCredentials, appConfig);
    this.tryAutoLogin();
    store.dispatch(setAppIsLoading(true));
  }

  async updateCurrentUser({ image, full_name, login }) {
    const updateData = {};
    if (full_name) {
      updateData.full_name = full_name;
    }
    if (login) {
      updateData.login = login;
    }
    if (image) {
      const file = preparationUploadImg(image);
      const { type, name, size } = file;
      const resultUploadImg = await ConnectyCube.storage.createAndUpload({ file, type, name, size, public: true });
      updateData.avatar = resultUploadImg.uid;
    }
    const responseUpdateUser = await ConnectyCube.users.update(updateData);
    const prevSession = await this.getUserSession();
    responseUpdateUser.user.avatar = getImageLinkFromUID(responseUpdateUser.user.avatar);
    const newSession = Object.assign(JSON.parse(prevSession), responseUpdateUser.user);
    await this.setUserSession(newSession);
    store.dispatch(updateCurrentUser(responseUpdateUser.user));
  }

  async tryAutoLogin() {
    const checkUserSessionFromStore = await this.getUserSession();
    if (checkUserSessionFromStore) {
      const data = JSON.parse(checkUserSessionFromStore);
      await this.signIn({ login: data.login, password: data.password });
    }

    store.dispatch(setAppIsLoading(false));
  }

  async signIn(params) {
    const session = await ConnectyCube.createSession(params);
    const currentUser = new User(session.user);
    session.user.avatar = getImageLinkFromUID(session.user.avatar);
    store.dispatch(setCurrentUser(session));
    const customSession = Object.assign({}, currentUser, { password: params.password });
    this.setUserSession(customSession);

    ChatService.connect(customSession.id, customSession.password);
  }

  async signUp(params) {
    await ConnectyCube.users.signup(params);
    return this.signIn(params);
  }

  async setUserSession(userSession) {
    return AsyncStorage.setItem(AuthService.CURRENT_USER_SESSION_KEY, JSON.stringify(userSession));
  }

  async getUserSession() {
    return await AsyncStorage.getItem(AuthService.CURRENT_USER_SESSION_KEY);
  }

  async unsubscribePushNotifications() {
    const subscriptionIdToDelete = await this.getStoreDeviceSubscriptionId();
    ConnectyCube.pushnotifications.subscriptions.delete(subscriptionIdToDelete);
  }

  async getStoreDeviceSubscriptionId() {
    return await AsyncStorage.getItem(AuthService.DEVICE_SUBSCRIPTION_ID);
  }

  async logout() {
    await this.unsubscribePushNotifications();
    await ChatService.disconnect();
    await AsyncStorage.clear();
    resetStore();
  }
}

export default new AuthService();
