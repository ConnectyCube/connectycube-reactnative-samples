import { Platform } from 'react-native';

const platformOS = Platform.OS;
const isIOS = platformOS === 'ios';
const isAndroid = platformOS === 'android';
const versionAndroid = Number(isAndroid ? Platform.Version : 0);

export {
  platformOS,
  isIOS,
  isAndroid,
  versionAndroid,
};
