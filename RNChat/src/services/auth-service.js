import React, { useContext } from 'react';
import ConnectyCube from 'react-native-connectycube';
import AsyncStorage from '@react-native-community/async-storage';

import appConfig from '../../config.json';
import User from '../models/user';
import { LogOut } from '../reducers/index';
import { setCurrentUser, updateCurrentUser } from '../actions/currentUser';
import { preparationUploadImg, getImageLinkFromUID } from '../helpers/file';
import GlobalContext from '../store';

const AuthContext = React.createContext();

export default AuthContext;

const AuthProvider = ({ children }) => {
  const { store, dispatch } = useContext(GlobalContext);

  const init = async () => {
    await ConnectyCube.init(...appConfig.connectyCubeConfig);
    return autologin();
  };

  const updateCurrentUserMethod = async ({ image, full_name, login }) => {
    const updateData = {};
    if (full_name) {
      updateData.full_name = full_name;
    }
    if (login) {
      updateData.login = login;
    }
    if (image) {
      const file = preparationUploadImg(image);
      const resultUploadImg = await ConnectyCube.storage.createAndUpload({ file });
      updateData.avatar = resultUploadImg.uid;
    }
    const responseUpdateUser = await ConnectyCube.users.update(updateData);
    const prewSession = await getUserSession();
    responseUpdateUser.user.avatar = getImageLinkFromUID(responseUpdateUser.user.avatar);
    const newSession = Object.assign(JSON.parse(prewSession), responseUpdateUser.user);
    await setUserSession(newSession);
    // eslint-disable-next-line import/no-named-as-default-member
    dispatch(updateCurrentUser(responseUpdateUser.user));
  };

  const autologin = async () => {
    const checkUserSessionFromStore = await getUserSession();
    if (checkUserSessionFromStore) {
      const data = JSON.parse(checkUserSessionFromStore);
      await signIn({ login: data.login, password: data.password });
      return 'Dialogs';
    } return 'Auth';
  };

  const signIn = async (params) => {
    const session = await ConnectyCube.createSession(params);
    const currentUser = new User(session.user);
    session.user.avatar = getImageLinkFromUID(session.user.avatar);
    // eslint-disable-next-line import/no-named-as-default-member
    dispatch(setCurrentUser(session));
    const customSession = { ...currentUser, password: params.password };
    setUserSession(customSession);
    connect(customSession.id, customSession.password);

    // Should return result matching setCurrentUser action
    return { ...session };
  };

  const signUp = async (params) => {
    await ConnectyCube.createSession();
    await ConnectyCube.users.signup(params);
    return signIn(params);
  };

  const setUserSession = async (userSession) => AsyncStorage.setItem(
    AuthProvider.CURRENT_USER_SESSION_KEY,
    JSON.stringify(userSession),
  );

  const getUserSession = async () => AsyncStorage.getItem(AuthProvider.CURRENT_USER_SESSION_KEY);

  const unsubscribePushNotifications = async () => {
    const token = await getStoreToken();
    ConnectyCube.pushnotifications.subscriptions.delete(token);
  };

  const getStoreToken = async () => AsyncStorage.getItem(AuthProvider.DEVICE_TOKEN_KEY);

  const logout = async () => {
    await unsubscribePushNotifications();
    await AsyncStorage.clear();
    await ConnectyCube.logout();
    dispatch(LogOut());
  };

  const connect = async (userId, password) => {
    await ConnectyCube.chat.connect({ userId, password });
  };

  return (
    <AuthContext.Provider
      value={{
        init,
        updateCurrentUser: updateCurrentUserMethod,
        autologin,
        signIn,
        signUp,
        setUserSession,
        getUserSession,
        unsubscribePushNotifications,
        getStoreToken,
        logout,
        connect,
        currentUser: store.currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.CURRENT_USER_SESSION_KEY = 'CURRENT_USER_SESSION_KEY';

AuthProvider.DEVICE_TOKEN_KEY = 'DEVICE_TOKEN_KEY';

export { AuthProvider };
