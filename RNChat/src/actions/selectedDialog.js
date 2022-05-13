export const SELECT_DIALOG = 'SELECT_DIALOG'
export const UNSELECT_DIALOG = 'UNSELECT_DIALOG'

export const selectDialog = dialog_id => ({ type: SELECT_DIALOG, dialog_id })
export const unselectDialog = () => ({ type: UNSELECT_DIALOG })