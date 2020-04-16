import React from 'react';
import { Provider } from 'react-redux';
import store from './src/store';
import Navigation from './src/routing/init';
import GlobalProvider from './src/contexts/GlobalProvider';

const App = () => (
  <Provider store={store}>
    <GlobalProvider>
      <Navigation />
    </GlobalProvider>
  </Provider>
);

export default App;
