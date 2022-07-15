import { users } from './config-users';
import { Platform, ToastAndroid } from 'react-native';
import Toast from 'react-native-simple-toast';

export function getUserById(userId, key) {
  const user = users.find(user => user.id == userId);

  if (typeof key === 'string') {
    return user[key];
  }

  return user;
};

export function getCallRecipientString(usersIds) {
  let opponentsNamesString = ""
  for (let i = 0; i < usersIds.length; ++i) {
    opponentsNamesString += getUserById(usersIds[i]).full_name
    if (i !== (usersIds.length - 1)) {
      opponentsNamesString += ", "
    }
  }

  return opponentsNamesString;
}

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function showToast(text) {
  const commonToast = Platform.OS === 'android' ? ToastAndroid : Toast;

  commonToast.showWithGravity(text, Toast.LONG, Toast.TOP);
};
