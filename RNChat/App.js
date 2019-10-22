import React from 'react';
import {Provider} from 'react-redux';
import store from './src/store';
import AppRoot from './src/components/Root';

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppRoot />
      </Provider>
    );
  }
}
