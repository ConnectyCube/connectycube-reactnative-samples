import {
  SET_CALL_SESSION,
  RESET_ACTIVE_CALL,
  ADD_OR_UPDATE_STREAM,
  REMOVE_STREAM,
  ACCEPT_CALL,
  MUTE_MICROPHONE
} from '../actions/activeCall'

const initialState = {
  session: null,
  isIcoming: false,
  isAccepted: false,
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
    case ADD_OR_UPDATE_STREAM:
      const { stream } = action;
      const existingStream = state.streams.find(s => s.userId === stream.userId)
      return {
        ...state,
        streams: existingStream 
                    ? state.streams.map(s => s.userId !== stream.userId ? s : stream) // replace
                    : [...state.streams, stream], // add
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