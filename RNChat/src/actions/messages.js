export const FETCH_MESSAGES = 'FETCH_MESSAGES'
export const PUSH_MESSAGE = 'PUSH_MESSAGE'

export const fetchMessages = history => ({ type: FETCH_MESSAGES, history: history })
export const pushMessage = message => ({ type: PUSH_MESSAGE, message: message })