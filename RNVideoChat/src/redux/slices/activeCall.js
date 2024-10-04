import { createSlice } from '@reduxjs/toolkit';

const activeCallInitialState = {
  session: null,
  isIncoming: false,
  isAccepted: false,
  isEarlyAccepted: false, // used when accepted via Call Kit, but the call session is not arrived yet
  isDummySession: false, // used when got incoming call on Android in bg/killed
  isMicrophoneMuted: false,
  streams: [],
};

const activeCallSlice = createSlice({
  name: 'activeCall',
  initialState: activeCallInitialState,
  reducers: {
    setCallSession: (state, { payload }) => Object.assign({}, state, {
      session: payload.session,
      isIncoming: payload.isIncoming ?? false,
      isDummySession: false,
    }),
    setDummyCallSession: (state, { payload }) => Object.assign({}, state, {
      session: payload,
      isIncoming: true,
      isDummySession: true,
    }),
    acceptCall: (state) => Object.assign({}, state, {
      isAccepted: true,
      isEarlyAccepted: false,
      isIncoming: true,
    }),
    earlyAcceptCall: (state) => Object.assign({}, state, {
      isAccepted: false,
      isEarlyAccepted: true,
      isIncoming: true,
    }),
    muteMicrophone: (state, { payload }) => Object.assign({}, state, {
      isMicrophoneMuted: payload,
    }),
    upsertStreams: (state, { payload }) => {
      let streams = [...state.streams];
      for (let stream of payload) {
        streams = streams.find(s => s.userId === stream.userId)
          ? streams.map(s => s.userId !== stream.userId ? s : stream) // replace
          : [...streams, stream]; // add
      }
      return Object.assign({}, state, { streams });
    },
    removeStream: (state, { payload }) => Object.assign({}, state, {
      streams: state.streams.filter(s => s.userId !== payload.userId),
    }),
    resetActiveCall: () => activeCallInitialState,
  },
});

export const activeCall = activeCallSlice.reducer;
export const {
  setCallSession,
  setDummyCallSession,
  acceptCall,
  earlyAcceptCall,
  muteMicrophone,
  upsertStreams,
  removeStream,
  resetActiveCall,
} = activeCallSlice.actions;
