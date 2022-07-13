import {
  SET_CALL_SESSION,
  RESET_ACTIVE_CALL,
  ADD_OR_UPDATE_STREAMS,
  REMOVE_STREAM,
  ACCEPT_CALL,
  DELAYED_ACCEPT_CALL,
  MUTE_MICROPHONE
} from '../actions/activeCall'

const initialState = {
  session: null,
  isIcoming: false,
  isAccepted: false,
  isEarlyAccepted: false, // used when accepted via Call Kit, but the call session is not arrived yet
  isMicrophoneMuted: false,
  streams: [],
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_CALL_SESSION:
      const { session, isIcoming } = action;
      return {
        ...state,
        session,
        isIcoming
      };
    case MUTE_MICROPHONE:
      return {
        ...state,
        isMicrophoneMuted: action.isMuted,
      };
    case ACCEPT_CALL:
      return {
        ...state,
        isAccepted: true,
      };
    case DELAYED_ACCEPT_CALL:
      return {
        ...state,
        isEarlyAccepted: true,
      };
    case ADD_OR_UPDATE_STREAMS:
      const { streams } = action;

      let updatedStreams = [...state.streams];
      for (let stream of streams) {
        const existingStream = updatedStreams.find(s => s.userId === stream.userId)
        updatedStreams = existingStream 
          ? updatedStreams.map(s => s.userId !== stream.userId ? s : stream) // replace
          : [...updatedStreams, stream]; // add
      }

      return {
        ...state,
        streams: updatedStreams
      };
    case REMOVE_STREAM:
      return {
        ...state,
        streams: state.streams.filter(s => s.userId !== action.stream.userId),
      };
    case RESET_ACTIVE_CALL:
      return {
        ...initialState
      };

    default:
      return state
  }
}