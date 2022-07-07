export const SET_CALL_SESSION = 'SET_CALL_SESSION'
export const ADD_OR_UPDATE_STREAM = 'ADD_OR_UPDATE_STREAM'
export const REMOVE_STREAM = 'REMOVE_STREAM'
export const RESET_ACTIVE_CALL = 'RESET_ACTIVE_CALL'

export const setCallSession = (session, isIcoming = false) => ({ type: SET_CALL_SESSION, session, isIcoming })
export const resetActiveCall = () => ({ type: RESET_ACTIVE_CALL })

export const addOrUpdateStream = (stream) => ({ type: ADD_OR_UPDATE_STREAM, stream })
export const removeStream = (stream) => ({ type: REMOVE_STREAM, stream })
