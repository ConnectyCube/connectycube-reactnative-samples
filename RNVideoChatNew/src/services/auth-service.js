import ConnectyCube from 'react-native-connectycube';

export default class AuthService {
  async login(user) {
    await ConnectyCube.createSession(user)
    return ConnectyCube.chat.connect({
      userId: user.id,
      password: user.password,
    })
  }

  logout(){
    ConnectyCube.chat.disconnect();
    ConnectyCube.destroySession();
  }
}
