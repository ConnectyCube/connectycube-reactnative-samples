export const PUSH_USER_ID = 'PUSH_USER_ID'
export const PULL_USER_ID = 'PULL_USER_ID'
export const CLEAR_SELECTED = 'CLEAR_SELECTED'

export const pushUserId = id => ({ type: PUSH_USER_ID, userId: id })
export const pullUserId = id => ({ type: PULL_USER_ID, userId: id })
export const clearSelectedUser = () => ({ type: CLEAR_SELECTED })