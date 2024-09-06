import EventEmitter from 'events';

const CUSTOM_EVENTS = {
  STOP_CALL_UI_RESET: 'STOP_CALL_UI_RESET',
};

const customEventEmitter = new EventEmitter();

export { CUSTOM_EVENTS };

export default customEventEmitter;
