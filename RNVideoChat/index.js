import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

AppRegistry.registerHeadlessTask(
  'RNCallKeepBackgroundMessage',
  () => ({name, callUUID, handle}) => {
    console.warn('registerHeadlessTask')
    return Promise.resolve();
  },
);