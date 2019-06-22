import {
	USERS_FOUND,
	USERS_NOT_FOUND,
	USERS_SEARCH_WARN,
	USERS_SEARCH_IN_PROGRESS
} from '../actions/usersSearch'

const defaultUsersSearch = {
	result: [],
	text: '',
	inProgress: false
}

export default (usersSearch = defaultUsersSearch, action) => {
	switch (action.type) {
		case USERS_FOUND:
			return {
				result: action.users,
				text: '',
				inProgress: false
			}

		case USERS_NOT_FOUND:
			return {
				result: [],
				text: 'No results found',
				inProgress: false
			}

		case USERS_SEARCH_WARN:
			return {
				result: [],
				text: 'Name must be more then 2 characters',
				inProgress: false
			}

		case USERS_SEARCH_IN_PROGRESS:
			return {
				result: [],
				text: '',
				inProgress: true
			}

		default:
			return usersSearch
	}
}