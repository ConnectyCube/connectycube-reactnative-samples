export const CHAT_CONNECTED = 'CHAT_CONNECTED'
export const CHAT_DISCONNECTED = 'CHAT_DISCONNECTED'

export const chatConnected = () => ({ type: CHAT_CONNECTED })
export const chatDisconnected = () => ({ type: CHAT_DISCONNECTED })