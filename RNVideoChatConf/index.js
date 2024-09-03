import { AppRegistry, LogBox } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

LogBox.ignoreLogs(['']);

notifee.registerForegroundService((notification) => {
  return new Promise(() => { });
});

AppRegistry.registerComponent(appName, () => App);
