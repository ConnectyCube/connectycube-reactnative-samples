import { combineReducers } from 'redux'
import currentUser from './currentUser'
import dialogs from './dialogs'
import messages from './messages'
import connection from './connection'
import users from './users'
import selectedDialog from './selectedDialog'

const appReducer = combineReducers({
  currentUser,
  dialogs,
  messages,
  connection,
  users,
  selectedDialog
})

export const LogOut = () => ({ type: 'RESSET_STORE' })

const rootReducer = (state, action) => {
  if (action.type === 'RESSET_STORE') {
    state = {}
  }
  return appReducer(state, action)
}

export default rootReducer