import { createSlice } from '@reduxjs/toolkit';

const appIsLoadingInitialState = true;
const appIsLoadingSlice = createSlice({
  name: 'appIsLoading',
  initialState: appIsLoadingInitialState,
  reducers: {
    setAppIsLoading: (_, action) => action.payload,
    resetAppIsLoading: () => appIsLoadingInitialState,
  },
});

export const appIsLoading = appIsLoadingSlice.reducer;
export const { setAppIsLoading, resetAppIsLoading } = appIsLoadingSlice.actions;
