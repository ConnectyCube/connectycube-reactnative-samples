export const USERS_FOUND = 'USERS_FOUND'
export const USERS_NOT_FOUND = 'USERS_NOT_FOUND'
export const USERS_SEARCH_WARN = 'USERS_SEARCH_WARN'
export const USERS_SEARCH_IN_PROGRESS = 'USERS_SEARCH_IN_PROGRESS'

export const usersFound = users => ({ type: USERS_FOUND, users: users })
export const usersNotFound = () => ({ type: USERS_NOT_FOUND })
export const usersSearchWarn = () => ({ type: USERS_SEARCH_WARN })
export const usersSearchInProgress = () => ({ type: USERS_SEARCH_IN_PROGRESS })