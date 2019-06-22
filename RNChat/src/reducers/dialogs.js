import {
	FETCH_DIALOGS,
	ADD_DIALOG,
	SORT_DIALOGS
} from '../actions/dialogs'
import { SELECT_DIALOG } from '../actions/selected'

export default (dialogs = [], action) => {
	switch (action.type) {
		case FETCH_DIALOGS:
			return action.dialogs
		
		case ADD_DIALOG:
			return [ action.dialog, ...dialogs ]

		case SORT_DIALOGS: {
			const { message, count } = action

			for (let i = 0; i < dialogs.length; i++) {
				const dialog = dialogs[i]

				if (dialog.id === message.dialog_id) {
					dialog.last_message = message.body
					dialog.last_message_date_sent = message.date_sent
					dialog.updated_at = message.date_sent
					if (count) dialog.unread_messages_count += 1
					dialogs.unshift(dialogs.splice(i, 1)[0])
					break
				}
			}

			return [ ...dialogs ]
		}
		
		case SELECT_DIALOG: {
			for (let i = 0; i < dialogs.length; i++) {
				const dialog = dialogs[i]

				if (dialog.id === action.dialog.id) {
					dialog.unread_messages_count = 0
					break
				}
			}

			return [ ...dialogs ]
		}

		default:
			return dialogs
	}
}