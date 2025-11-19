import { StatusBar, useColorScheme, ColorSchemeName } from 'react-native';
import { Provider } from 'react-redux';
import AppNavigator from './src/components/app-navigator';
import store from './src/redux/store';

function App() {
  const isDarkMode = useColorScheme() === ('dark' as ColorSchemeName);

  return (
    <Provider store={store}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </Provider>
  );
}

export default App;
