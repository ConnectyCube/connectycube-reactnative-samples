import {
  FETCH_DIALOGS,
  ADD_DIALOG,
  SORT_DIALOGS,
  UPDATE_DIALOG,
  DELETE_DIALOG
} from '../actions/dialogs'
import { updateDialog, sortedDialog } from './reducer-function'

export default (dialogs = [], action) => {
  switch (action.type) {
    case FETCH_DIALOGS:
      return action.dialogs

    case UPDATE_DIALOG: {
      const result = updateDialog(action, dialogs)
      return result
    }

    case ADD_DIALOG:
      return [action.dialog, ...dialogs]

    case SORT_DIALOGS: {
      const result = sortedDialog(action, dialogs)
      return result
    }

    case DELETE_DIALOG: {
      const result = dialogs.filter(dialog => dialog.id !== action.dialogId)
      return result
    }

    default:
      return dialogs
  }
}