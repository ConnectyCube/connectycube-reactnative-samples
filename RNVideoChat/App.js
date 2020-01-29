import React, {Component} from 'react';
import Navigator from './src/navigator';
import {AuthService} from './src/services';

export default class App extends Component {
  constructor(props) {
    super(props);

    AuthService.init();
  }

  render = () => <Navigator />;
}
