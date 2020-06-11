import EventEmitter from 'events';

const CUSTOM_EVENTS = {
  STOP_CALL_UI_RESET: 'STOP_CALL_UI_RESET'
}

const customEventEmiter = new EventEmitter()

export { CUSTOM_EVENTS }

export default customEventEmiter
