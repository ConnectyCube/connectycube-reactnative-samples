import { USER_LOGIN, USER_LOGOUT } from '../actions/user'

export default (state = null, action) => {
	switch (action.type) {
		case USER_LOGIN:
			return { ...action.user }
		case USER_LOGOUT:
			return null
		default:
			return state
	}
}
