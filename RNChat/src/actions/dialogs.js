export const FETCH_DIALOGS = 'FETCH_DIALOGS'
export const ADD_DIALOG = 'ADD_DIALOG'
export const SORT_DIALOGS = 'SORT_DIALOGS'

export const fetchDialogs = dialogs => ({ type: FETCH_DIALOGS, dialogs: dialogs })
export const addNewDialog = dialog => ({ type: ADD_DIALOG, dialog: dialog })
export const sortDialogs = (message, count) => ({ type: SORT_DIALOGS, message: message, count: count })
