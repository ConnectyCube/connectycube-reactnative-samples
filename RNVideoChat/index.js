/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import ConnectyCube from 'react-native-connectycube';
import config from './connectycube_config.json';

ConnectyCube.init(...config.connectyCubeConfig);
AppRegistry.registerComponent(appName, () => App);
