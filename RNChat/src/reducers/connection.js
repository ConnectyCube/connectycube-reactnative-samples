import { CHAT_CONNECTED, CHAT_DISCONNECTED, CHAT_CONNECTING, DISCONNECTED } from '../actions/connection'

export default (chatConnectionState = DISCONNECTED, action) => {
  switch (action.type) {
  case CHAT_CONNECTED: return action.chatConnectionState
  case CHAT_CONNECTING: return action.chatConnectionState
  case CHAT_DISCONNECTED: return action.chatConnectionState
  default: return chatConnectionState
  }
}