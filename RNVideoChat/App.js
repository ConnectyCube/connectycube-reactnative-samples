import React, {Component} from 'react';
import Navigator from './src/navigator';
import { CallService } from './src/services';
import config from './src/config';
import ConnectyCube from 'react-native-connectycube';

export default class App extends Component {
  constructor(props) {
    super(props);

    ConnectyCube.init(...config);

    CallService.init(
      require('./assets/sounds/dialing.mp3'),
      require('./assets/sounds/calling.mp3'),
      require('./assets/sounds/end_call.mp3')
    )
  }

  render = () => <Navigator />;
}
