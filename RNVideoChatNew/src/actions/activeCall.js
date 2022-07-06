export const SET_CALL_SESSION = 'SET_CALL_SESSION'
export const ADD_STREAM = 'ADD_STREAM'
export const REMOVE_STREAM = 'REMOVE_STREAM'
export const RESET_ACTIVE_CALL = 'RESET_ACTIVE_CALL'

export const setCallSession = (session) => ({ type: SET_CALL_SESSION, session })
export const resetActiveCall = () => ({ type: RESET_ACTIVE_CALL })

export const addStream = (stream) => ({ type: ADD_STREAM, stream })
export const removeStream = (stream) => ({ type: REMOVE_STREAM, stream })
