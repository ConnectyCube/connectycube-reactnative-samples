import { createSlice } from '@reduxjs/toolkit';

const isLoggingInitialState = false;

const isLoggingSlice = createSlice({
  name: 'isLogging',
  initialState: isLoggingInitialState,
  reducers: {
    setIsLogging: (_, action) => action.payload,
    resetIsLogging: () => isLoggingInitialState,
  },
});

export const isLogging = isLoggingSlice.reducer;
export const { setIsLogging, resetIsLogging } = isLoggingSlice.actions;
