import {AppRegistry} from 'react-native';
import 'react-native-gesture-handler';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from 'react-native-push-notification';


AppRegistry.registerComponent(appName, () => App);

console.log('app-started~');

// PushNotification.callNative('addEventListener', 'notification', function(){
//   console.log('PushNotification.addEventListener', arguments)
// })

AppRegistry.registerHeadlessTask('RNCallKeepBackgroundMessage', () => ({ name, callUUID, handle }) => {
  return Promise.resolve();
});