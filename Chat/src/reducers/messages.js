import {
  PUSH_MESSAGE,
  FETCH_MESSAGES,
  DELETE_ALL_MESSAGES,
  LAZY_FETCH_MESSAGES
} from '../actions/messages'

import { lazyFetchMessages, updateStatusMessages } from './reducer-function'

export default (messages = {}, action) => {
  switch (action.type) {
    case FETCH_MESSAGES: {
      return { ...messages, [action.dialogId]: action.history }
    }

    case LAZY_FETCH_MESSAGES: {
      const result = lazyFetchMessages(action, messages)
      return result
    }

    case UPDATE_MESSAGES: {
      const mergedUpdatedMessages = updateStatusMessages(action, messages)
      return mergedUpdatedMessages
    }

    case PUSH_MESSAGE: {
      const copyMessages = messages[action.dialogId] || []
      return {
        ...messages,
        [action.dialogId]: [action.message, ...copyMessages]
      }
    }

    case DELETE_ALL_MESSAGES: {
      return {
        ...messages,
        [action.dialogId]: []
      }
    }

    default:
      return messages
  }
}