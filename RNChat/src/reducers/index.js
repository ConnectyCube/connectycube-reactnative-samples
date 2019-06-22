import { combineReducers } from 'redux'
import auth from './auth'
import dialogs from './dialogs'
import connection from './connection'
import messages from './messages'
import selected from './selected'
import user from './user'
import usersSearch from './usersSearch'
import usersSelect from './usersSelect'

export default combineReducers({
	auth,
	connection,
	dialogs,
	messages,
	selected,
	user,
	usersSearch,
	usersSelect
})
