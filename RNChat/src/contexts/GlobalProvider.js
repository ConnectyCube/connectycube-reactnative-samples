import React, { useState } from 'react';

import GlobalContext from './GlobalContext';

const GlobalProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const resetCurrentUser = () => setCurrentUser(null);

  const updateCurrentUser = curCurrentUser => {
    const currentUserCopy = JSON.parse(JSON.stringify(currentUser));
    const result = { ...currentUser.user, ...curCurrentUser };
    currentUserCopy.user = result;
    setCurrentUser(currentUserCopy);
    return { ...currentUser };
  };

  return (
    <GlobalContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        resetCurrentUser,
        updateCurrentUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
