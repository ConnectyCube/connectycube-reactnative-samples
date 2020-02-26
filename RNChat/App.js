import React from 'react'
import { Provider, connect } from 'react-redux'
import store from './src/store'
import Navigation from './src/routing/init'

export default class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <Navigation />
      </Provider>
    );
  }
}
