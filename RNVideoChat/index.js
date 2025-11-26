/**
 * @format
 */

import App from './App';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { AuthService, CallKeepService, CallService, PushService } from './src/services';


PushService.init();
AuthService.init();
CallService.init();
CallKeepService.setup();

AppRegistry.registerComponent(appName, () => App);
