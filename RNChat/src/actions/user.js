export const USER_LOGIN = 'USER_LOGIN'
export const USER_LOGOUT = 'USER_LOGOUT'

export const userLogin = user => ({ type: USER_LOGIN, user: user })
export const userLogout = () => ({ type: USER_LOGOUT })
