import {
  SET_CALL_SESSION,
  RESET_ACTIVE_CALL,
  ADD_OR_UPDATE_STREAM,
  REMOVE_STREAM
} from '../actions/activeCall'

const initialState = {
  session: null,
  isIcoming: false,
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