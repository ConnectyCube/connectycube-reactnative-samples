import EventEmitter from 'events';

const CUSTOM_EVENTS = {
  ON_NOTIFICATION_OPEN: 'ON_NOTIFICATION_OPEN',
};

const customEventEmitter = new EventEmitter();

export { CUSTOM_EVENTS };

export default customEventEmitter;
