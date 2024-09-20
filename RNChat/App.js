import React from 'react';
import { Provider } from 'react-redux';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import store from './src/redux/store';
import Navigation from './src/navigation';

export default function App() {
  return (
    <Provider store={store}>
      <KeyboardProvider>
        <Navigation />
      </KeyboardProvider>
    </Provider>
  );
}
