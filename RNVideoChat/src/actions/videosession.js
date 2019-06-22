export const VIDEO_SESSION_OBTAINED = 'VIDEO_SESSION_OBTAINED'
export const CLEAR_VIDEO_SESSION = 'CLEAR_VIDEO_SESSION'

export const USER_IS_CALLING = 'USER_IS_CALLING'
export const CALL_IN_PROGRESS = 'CALL_IN_PROGRESS'

export const LOCAL_VIDEO_STREAM_OBTAINED = 'LOCAL_VIDEO_STREAM_OBTAINED'
export const REMOTE_VIDEO_STREAM_OBTAINED = 'REMOTE_VIDEO_STREAM_OBTAINED'
export const CLEAR_VIDEO_STREAMS = 'CLEAR_VIDEO_STREAMS'

export const MUTE_AUDIO = 'MUTE_AUDIO'

export const SET_MEDIA_DEVICES = 'SET_MEDIA_DEVICES'


export const videoSessionObtained = videoSession => ({ type: VIDEO_SESSION_OBTAINED, videoSession: videoSession })
export const clearVideoSession = () => ({ type: CLEAR_VIDEO_SESSION })

export const userIsCalling = userIsCalling => ({ type: USER_IS_CALLING, userIsCalling: userIsCalling })
export const callInProgress = callInProgress => ({ type: CALL_IN_PROGRESS, callInProgress: callInProgress })

export const localVideoStreamObtained = localStream => ({ type: LOCAL_VIDEO_STREAM_OBTAINED, stream: localStream, userId: "local" })
export const remoteVideoStreamObtained = (remoteStream, userId) => ({ type: REMOTE_VIDEO_STREAM_OBTAINED, stream: remoteStream, userId: userId })
export const clearVideoStreams = () => ({ type: CLEAR_VIDEO_STREAMS })

export const muteAudio = mute => ({ type: MUTE_AUDIO, mute: mute })

export const setMediaDevices = mediaDevices => ({ type: SET_MEDIA_DEVICES, mediaDevices: mediaDevices })
