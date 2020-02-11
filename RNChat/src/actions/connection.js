export const CHAT_DISCONNECTED = 'CHAT_DISCONNECTED'
export const CHAT_CONNECTING = 'CHAT_CONNECTING'
export const CHAT_CONNECTED = 'CHAT_CONNECTED'

export const DISCONNECTED = 0
export const CONNECTING = 1
export const CONNECTED = 2

export const chatDisconnected = () => ({ type: CHAT_DISCONNECTED, chatConnectionState: DISCONNECTED })
export const chatConnecting = () => ({ type: CHAT_CONNECTING, chatConnectionState: CONNECTING })
export const chatConnected = () => ({ type: CHAT_CONNECTED, chatConnectionState: CONNECTED })
