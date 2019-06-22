import { PUSH_USER_ID, PULL_USER_ID, CLEAR_SELECTED } from '../actions/usersSelect'

export default (selectedUsers = [], action) => {
	switch (action.type) {
		case PUSH_USER_ID:
			return [ ...selectedUsers, action.userId ]

		case PULL_USER_ID:
			return selectedUsers.filter(id => (id !== action.userId))

		case CLEAR_SELECTED:
			return []

		default:
			return selectedUsers
	}
}