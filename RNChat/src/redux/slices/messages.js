import { createSlice } from '@reduxjs/toolkit';
import { getLazyFetchMessages, updateStatusMessages } from '../reducer-function';

const messagesInitialState = {};
const messagesSlice = createSlice({
  name: 'messages',
  initialState: messagesInitialState,
  reducers: {
    fetchMessages: (history, action) => {
      const { messages, dialogId } = action.payload;
      return { ...history, [dialogId]: messages };
    },
    lazyFetchMessages: (history, action) => getLazyFetchMessages(action.payload, history),
    updateMessages: (history, action) => updateStatusMessages(action.payload, history),
    pushMessage: (history, action) => {
      const { message, dialogId } = action.payload;
      const id = dialogId || message.dialog_id;
      const copiedMessages = history[id] || [];
      return { ...history, [id]: [message, ...copiedMessages] };
    },
    clearMessages: (history, action) => {
      const { dialogId } = action.payload;
      delete history[dialogId];
      return { ...history };
    },
    resetMessages: () => messagesInitialState,
  },
});

export const messages = messagesSlice.reducer;
export const { fetchMessages, lazyFetchMessages, updateMessages, pushMessage, clearMessages, resetMessages } = messagesSlice.actions;
