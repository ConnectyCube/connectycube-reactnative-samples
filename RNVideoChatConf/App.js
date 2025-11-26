import React, { Component } from 'react';
import Navigator from './src/navigator';
import { initConnectyCube } from '@connectycube/react';
import { appConfig, credentials } from './src/config';

export default class App extends Component {
  constructor(props) {
    super(props);
    initConnectyCube(credentials, appConfig);
  }

  render = () => <Navigator />;
}
