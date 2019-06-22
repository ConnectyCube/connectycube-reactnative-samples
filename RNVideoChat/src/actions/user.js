export const USER_LOGIN = 'USER_LOGIN'
export const USER_LOGOUT = 'USER_LOGOUT'
export const VIDEO_CALL_OPPONENTS = 'VIDEO_CALL_OPPONENTS'
export const USER_IS_LOGGING = 'USER_IS_LOGGING'

export const userLogin = user => ({ type: USER_LOGIN, user: user })
export const userLogout = () => ({ type: USER_LOGOUT })
export const videoCallOpponentsIds = opponentsIds => ({ type: VIDEO_CALL_OPPONENTS, opponentsIds: opponentsIds })
export const userIsLogging = userIsLogging => ({ type: USER_IS_LOGGING, userIsLogging: userIsLogging })
