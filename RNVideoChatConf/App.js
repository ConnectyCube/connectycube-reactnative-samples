import React, { Component } from 'react';
import Navigator from './src/navigator';
import { ConnectyCube } from '@connectycube/react';
import { appConfig, credentials } from './src/config';

export default class App extends Component {
  constructor(props) {
    super(props);
    ConnectyCube.init(credentials, appConfig);
  }

  render = () => <Navigator />;
}
