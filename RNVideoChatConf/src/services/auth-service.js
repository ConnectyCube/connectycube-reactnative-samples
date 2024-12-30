import ConnectyCube from 'react-native-connectycube';
import { credentials, appConfig } from '../config';
import CallService from './call-service';

export default class AuthService {
  init = (janusServerEndpoint = null) => {
    if (janusServerEndpoint) {
      appConfig.conference.server = janusServerEndpoint;
    }
    ConnectyCube.init(credentials, appConfig);
  };

  createSession(user) {
    return ConnectyCube.createSession(user);
  }

  login = (user) => {
    return new Promise((resolve, reject) => {
      this.createSession(user)
        .then(() => {
          CallService.CURRENT_USER = { full_name: user.full_name, id: user.id };
          return ConnectyCube.chat.connect({
            userId: user.id,
            password: user.password,
          });
        })
        .then(resolve)
        .catch(reject);
    });
  };

  logout = () => {
    ConnectyCube.chat.disconnect();
    ConnectyCube.destroySession();
  };
}
