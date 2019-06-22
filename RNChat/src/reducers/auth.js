import { TOGGLE_AUTH, TOGGLE_MODAL } from '../actions/auth'

const initialState = {
	isLogin: true,
	isModal: false,
}

export default (state = initialState, action) => {
	switch (action.type) {
		case TOGGLE_AUTH:
			return {
				...state,
				isLogin: !state.isLogin,
			}
		case TOGGLE_MODAL:
			return {
				...state,
				isModal: !state.isModal,
			}
		default:
			return state
	}
}
