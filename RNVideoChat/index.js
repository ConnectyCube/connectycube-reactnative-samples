/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import ConnectyCube from 'react-native-connectycube';
import { appCredentials, appConfig } from './src/config';
import { CallKeepService, PushNotificationsService } from './src/services';
import notifee, { EventType } from '@notifee/react-native';

LogBox.ignoreLogs(['']);

// notifee.registerForegroundService((notification) => {
//   console.error('>>>>>>>>>>>>>>>>', notification);
//   return new Promise(() => {
//     console.error(notification);

//     notifee.onForegroundEvent(async ({ type, detail }) => {
//       if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'stop') {
//         await notifee.stopForegroundService();
//       }
//     });
//   });
// });
CallKeepService.setup();
CallKeepService.registerEvents();
PushNotificationsService.registerEvents();

ConnectyCube.init(appCredentials, appConfig);
AppRegistry.registerComponent(appName, () => App);
