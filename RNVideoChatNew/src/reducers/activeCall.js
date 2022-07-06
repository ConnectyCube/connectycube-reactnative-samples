import {
  SET_CALL_SESSION,
  RESET_ACTIVE_CALL,
  ADD_STREAM,
  REMOVE_STREAM
} from '../actions/activeCall'

const initialState = {
  session: null,
  streams: []
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_CALL_SESSION:
      const { session } = action.payload;
      return {
        ...state,
        session,
      };
    case ADD_STREAM:
      const { stream } = action.payload;
      return {
        ...state,
        streams: [...state.streams, stream],
      };
    case REMOVE_STREAM:
      return {
        ...state,
        streams: state.streams.filter(item => item.userId !== action.payload.stream.userId),
      };
    case RESET_ACTIVE_CALL:
      return {
        ...initialState
      };

    default:
      return state
  }
}