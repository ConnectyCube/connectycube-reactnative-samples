import { createSlice } from '@reduxjs/toolkit';
import { getUpdatedDialogs, getSortedDialogs } from '../reducer-function';

const dialogsInitialState = [];
const dialogsSlice = createSlice({
  name: 'dialogs',
  initialState: dialogsInitialState,
  reducers: {
    fetchDialogs: (_dialogs, action) => action.payload,
    updateDialog: (dialogs, action) => getUpdatedDialogs(action.payload, dialogs),
    addNewDialog: (dialogs, action) => [action.payload, ...dialogs],
    sortDialogs: (dialogs, action) => getSortedDialogs(action.payload, dialogs),
    deleteDialog: (dialogs, action) => dialogs.filter(dialog => dialog.id !== action.payload),
    resetDialogs: () => dialogsInitialState,
  },
});

export const dialogs = dialogsSlice.reducer;
export const { fetchDialogs, updateDialog, addNewDialog, sortDialogs, deleteDialog, resetDialogs } = dialogsSlice.actions;
