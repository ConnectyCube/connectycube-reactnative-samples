import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  STATUS_DELIVERED,
  STATUS_PENDING,
  STATUS_READ,
  STATUS_SENT,
} from '../../models/message';

const MessageSendState = ({ send_state }) => {
  switch (send_state) {
  case STATUS_PENDING:
    return (<Icon name="query-builder" size={12} color="white" />);
  case STATUS_SENT:
    return (<Icon name="done" size={12} color="white" />);
  case STATUS_DELIVERED:
    return (<Icon name="done-all" size={12} color="white" />);
  case STATUS_READ:
    return (<Icon name="done-all" size={12} color="#ffeb3b" />);
  default:
    return null;
  }
};

export default MessageSendState;
