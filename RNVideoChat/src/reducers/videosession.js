import {
	VIDEO_SESSION_OBTAINED,
	USER_IS_CALLING,
	LOCAL_VIDEO_STREAM_OBTAINED,
	REMOTE_VIDEO_STREAM_OBTAINED,
	CLEAR_VIDEO_SESSION,
	CLEAR_VIDEO_STREAMS,
	CALL_IN_PROGRESS,
	MUTE_AUDIO,
	SET_MEDIA_DEVICES
} from '../actions/videosession'

const initialState = {
	userIsCalling: false,
	callInProgress: false,
	videoSession: null,
	localVideoStream: null,
	videoStreams: {},
	audioMuted: false,
	mediaDevices: [],
}

export default (state = initialState, action) => {
	switch (action.type) {
		case VIDEO_SESSION_OBTAINED:
			return {
				...state,
				videoSession: action.videoSession
			}
		case CLEAR_VIDEO_SESSION:
			return {
				...state,
				videoSession: null
			}
		case USER_IS_CALLING:
			return {
				...state,
				userIsCalling: action.userIsCalling
			}
		case CALL_IN_PROGRESS:
			return {
				...state,
				callInProgress: action.callInProgress
			}
		case LOCAL_VIDEO_STREAM_OBTAINED:
			state.videoStreams[action.userId] = action.stream
			return {
				...state,
				localVideoStream: action.stream
			}
		case REMOTE_VIDEO_STREAM_OBTAINED:
			state.videoStreams[action.userId] = action.stream
			return {
				...state
			}
		case CLEAR_VIDEO_STREAMS:
			return {
				...state,
				localVideoStream: null,
				videoStreams: []
			}
		case MUTE_AUDIO:
			return {
				...state,
				audioMuted: action.mute
			}
		case SET_MEDIA_DEVICES:
			return {
				...state,
				mediaDevices: action.mediaDevices
			}
		default:
			return state
	}
}
