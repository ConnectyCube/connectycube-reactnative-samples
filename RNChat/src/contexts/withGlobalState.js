import React from 'react';
import GlobalContext from './GlobalContext';

const withGlobalState = (InputComponent) => (props) => (
  <GlobalContext.Consumer>
    {context => (!context.loading
      && <InputComponent {...props} {...context} />)}
  </GlobalContext.Consumer>
);

export default withGlobalState;
