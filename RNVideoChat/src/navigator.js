import {createAppContainer} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';
import AuthScreen from './components/AuthScreen';
import VideoScreen from './components/VideoScreen';

const StackNavigator = createStackNavigator(
  {
    AuthScreen: {
      screen: AuthScreen,
    },
    VideoScreen: {
      screen: VideoScreen,
    },
  },
  {
    initialRouteName: 'AuthScreen',
    headerMode: 'none',
  },
);

export default createAppContainer(StackNavigator);
