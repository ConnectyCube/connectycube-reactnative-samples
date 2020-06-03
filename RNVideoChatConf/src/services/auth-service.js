import ConnectyCube from 'react-native-connectycube';
import { credentials, appConfig } from '../config';

export default class AuthService {
  init = (janusServerEndpoint = null) => {
    if (janusServerEndpoint) {
      config.conference.server = janusServerEndpoint
    }
    ConnectyCube.init(credentials, appConfig)
  }

  login = user => {
    return new Promise((resolve, reject) => {
      ConnectyCube.createSession(user)
        .then(() =>
          ConnectyCube.chat.connect({
            userId: user.id,
            password: user.password,
          }),
        )
        .then(resolve)
        .catch(reject);
    });
  };

  createSession(user) {
    return ConnectyCube.createSession(user)
  }

  login = user => {
    return new Promise((resolve, reject) => {
      this.createSession(user)
        .then(() => ConnectyCube.chat.connect({ userId: user.id, password: user.password }))
        .then(() => {
          resolve();
        })
        .catch(reject);
    });
  };



  logout = () => {
    ConnectyCube.chat.disconnect();
    ConnectyCube.destroySession();
  };

}
