import { USER_LOGIN, USER_LOGOUT, VIDEO_CALL_OPPONENTS, USER_IS_LOGGING } from '../actions/user'

const initialState = {
	userIsLogging: false,
	user: null,
	opponentsIds: null
}

export default (state = initialState, action) => {
	switch (action.type) {
		case USER_LOGIN:
			return {
				...state,
				user: action.user,
			}
		case USER_LOGOUT:
			return {
				...state,
				user: null,
			}
		case VIDEO_CALL_OPPONENTS: {
			let res = {
				...state,
				opponentsIds: action.opponentsIds,
			}
			return res;
		}
		case USER_IS_LOGGING: {
			return {
				...state,
				userIsLogging: action.userIsLogging,
			}
		}
		default:
			return state
	}
}
