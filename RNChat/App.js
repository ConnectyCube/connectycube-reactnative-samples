import React from 'react';

import Navigation from './src/routing/init';
import { Provider } from './src/store';
import { AuthProvider } from './src/services/auth-service';
import { ChatProvider } from './src/services/chat-service';
import { PushNotificationProvider } from './src/services/push-notification';
import { UsersProvider } from './src/services/users-service';

const App = () => (
  <Provider>
    <AuthProvider>
      <ChatProvider>
        <PushNotificationProvider>
          <UsersProvider>
            <Navigation />
          </UsersProvider>
        </PushNotificationProvider>
      </ChatProvider>
    </AuthProvider>
  </Provider>
);

export default App;
