/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import { name as appName } from './app.json';
import { appCredentials, appConfig } from './src/config';
import { CallKeepService, CallService, PushNotificationsService } from './src/services';
import App from './App';

LogBox.ignoreLogs(['']);

ConnectyCube.init(appCredentials, appConfig);
PushNotificationsService.registerEvents();
CallService.registerEvents();
CallKeepService.setup();
AppRegistry.registerComponent(appName, () => App);
