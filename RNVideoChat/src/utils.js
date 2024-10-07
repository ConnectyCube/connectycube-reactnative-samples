import { users } from './config';
import { Platform } from 'react-native';
import Toast from 'react-native-simple-toast';

export const platformOS = Platform.OS;
export const isIOS = platformOS === 'ios';
export const isAndroid = platformOS === 'android';
export const versionAndroid = Number(isAndroid ? Platform.Version : -1);

export function getUserById(userId, key) {
  const user = users.find(({ id }) => id === userId);

  return typeof key === 'string' && user?.hasOwnProperty(key)
    ? user[key]
    : user;
}

export function getCallRecipientString(usersIds) {
  let opponentsNamesString = '';
  for (let i = 0; i < usersIds.length; ++i) {
    opponentsNamesString += getUserById(usersIds[i]).full_name;
    if (i !== (usersIds.length - 1)) {
      opponentsNamesString += ', ';
    }
  }
  return opponentsNamesString;
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function showToast(text) {
  Toast.showWithGravity(text, Toast.LONG, Toast.TOP);
}

export function isCurrentRoute(navigation, routeName) {
  const routes = navigation.getState().routes;
  const currentRoute = routes[routes.length - 1];
  return currentRoute.name === routeName;
}

