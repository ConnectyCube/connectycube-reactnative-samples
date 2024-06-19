import React from 'react';
import AppNavigator from './src/navigator';
import { AuthService } from './src/services';

const App = () => {
  React.useEffect(() => {
    AuthService.init();
  }, []);

  return <AppNavigator />;
};

export default App;
