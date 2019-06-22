export const SELECT_DIALOG = 'SELECT_DIALOG'
export const UNSELECT_DIALOG = 'UNSELECT_DIALOG'

export const setSelected = dialog => ({ type: SELECT_DIALOG, dialog: dialog })
export const removeSelected = () => ({ type: UNSELECT_DIALOG })