import 'react-native-gesture-handler';
import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { PushNotificationService } from './src/services';

LogBox.ignoreLogs(['']);
PushNotificationService.registerEvents();
AppRegistry.registerComponent(appName, () => App);
