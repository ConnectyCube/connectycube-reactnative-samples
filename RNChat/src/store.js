import React, { useReducer } from 'react';

import rootReducer from './reducers';

const GlobalContext = React.createContext();

export default GlobalContext;

const Provider = ({ children }) => {
  const [store, dispatch] = useReducer(rootReducer, {});
  return (
    <GlobalContext.Provider
      value={{
        store,
        dispatch,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export { Provider };
