import React from 'react';
import { Provider, connect } from 'react-redux';
import store from './src/store';
import Navigation from './src/routing/init';

const App = () => (
  <Provider store={store}>
    <Navigation />
  </Provider>
);

export default App;
