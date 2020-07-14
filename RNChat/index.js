import { AppRegistry, LogBox } from 'react-native'
import { name as appName } from './config.json'
import App from './App'

LogBox.ignoreLogs([
    'currentlyFocusedField is deprecated and will be removed in a future release.',
    'Calling `getNode()` on the ref of an Animated component is no longer necessary.'
]);

AppRegistry.registerComponent(appName, () => App)
