import React from 'react';
import ConnectyCube from 'react-native-connectycube';
import config from '../config';

const AuthContext = React.createContext();

export default AuthContext;

const AuthProvider = ({ children }) => {
  const init = () => ConnectyCube.init(...config);

  const login = user =>
    new Promise(async (resolve, reject) => {
      try {
        await ConnectyCube.createSession(user);
        const result = await ConnectyCube.chat.connect({
          userId: user.id,
          password: user.password,
        });
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });

  const logout = () => {
    ConnectyCube.chat.disconnect();
    ConnectyCube.destroySession();
  };

  return (
    <AuthContext.Provider
      value={{
        init,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider };
