import { CHAT_CONNECTED, CHAT_DISCONNECTED } from '../actions/connection'

export default (connected = false, action) => {
	switch (action.type) {
		case CHAT_CONNECTED: return true
    case CHAT_DISCONNECTED: return false
		default: return connected
	}
}