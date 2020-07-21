import React from 'react';
import Navigator from './src/navigator';
import { AuthProvider } from './src/services/auth-service';
import { CallProvider } from './src/services/call-service';

const App = () => (
  <AuthProvider>
    <CallProvider>
      <Navigator />
    </CallProvider>
  </AuthProvider>
);

export default App;
