import Dialog from '../models/Dialog'
import { SELECT_DIALOG, UNSELECT_DIALOG } from '../actions/selected'

export default (dialog = new Dialog(), action) => {
	switch (action.type) {
		case SELECT_DIALOG:
			return { ...action.dialog }

		case UNSELECT_DIALOG:
			return new Dialog()
      
		default:
			return dialog
	}
}