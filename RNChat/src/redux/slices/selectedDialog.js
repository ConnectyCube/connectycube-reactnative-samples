import { createSlice } from '@reduxjs/toolkit';

const selectedDialogInitialState = '';
const selectedDialogSlice = createSlice({
  name: 'selectedDialog',
  initialState: selectedDialogInitialState,
  reducers: {
    selectDialog: (_, action) => action.payload,
    unselectDialog: () => selectedDialogInitialState,
  },
});

export const selectedDialog = selectedDialogSlice.reducer;
export const { selectDialog, unselectDialog } = selectedDialogSlice.actions;
