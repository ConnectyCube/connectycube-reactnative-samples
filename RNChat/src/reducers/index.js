import currentUser from './currentUser';
import dialogs from './dialogs';
import messages from './messages';
import connection from './connection';
import users from './users';
import selectedDialog from './selectedDialog';

const combineReducers = (reducers) =>
  (state = {}, action) => {
    const newState = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key in reducers) {
      // eslint-disable-next-line no-prototype-builtins
      if (reducers.hasOwnProperty(key)) {
        newState[key] = reducers[key](state[key], action);
      }
    }
    return newState;
  };

const appReducer = combineReducers({
  currentUser,
  dialogs,
  messages,
  connection,
  users,
  selectedDialog,
});

export const LogOut = () => ({ type: 'RESSET_STORE' });

const rootReducer = (state, action) => {
  if (action.type === 'RESSET_STORE') {
    state = {};
  }
  return appReducer(state, action);
};

export default rootReducer;
