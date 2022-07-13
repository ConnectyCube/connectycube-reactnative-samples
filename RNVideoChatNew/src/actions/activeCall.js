export const SET_CALL_SESSION = 'SET_CALL_SESSION'
export const ACCEPT_CALL = 'ACCEPT_CALL'
export const ADD_OR_UPDATE_STREAM = 'ADD_OR_UPDATE_STREAM'
export const REMOVE_STREAM = 'REMOVE_STREAM'
export const RESET_ACTIVE_CALL = 'RESET_ACTIVE_CALL'
export const MUTE_MICROPHONE = 'MUTE_MICROPHONE'

export const setCallSession = (session, isIcoming = false) => ({ type: SET_CALL_SESSION, session, isIcoming })
export const resetActiveCall = () => ({ type: RESET_ACTIVE_CALL })

export const acceptCall = () => ({ type: ACCEPT_CALL })

export const muteMicrophone = (isMuted) => ({ type: MUTE_MICROPHONE, isMuted })

export const addOrUpdateStream = (stream) => ({ type: ADD_OR_UPDATE_STREAM, stream })
export const removeStream = (stream) => ({ type: REMOVE_STREAM, stream })
