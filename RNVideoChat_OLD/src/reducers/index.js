import { combineReducers } from 'redux'
import currentUser from './currentUser'
import activeCall from './activeCall'

const appReducer = combineReducers({
  currentUser,
  activeCall
})

export const LogOut = () => ({ type: 'RESSET_STORE' })

const rootReducer = (state, action) => {
  if (action.type === 'RESSET_STORE') {
    state = {}
  }
  return appReducer(state, action)
}

export default rootReducer