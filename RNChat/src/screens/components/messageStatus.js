import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { STATUS } from '../../models/message';

export default function MessageStatus({ send_state }) {
  switch (send_state) {
    case STATUS.PENDING:
      return (<Icon name="query-builder" size={12} color="white" />);
    case STATUS.SENT:
      return (<Icon name="done" size={12} color="white" />);
    case STATUS.DELIVERED:
      return (<Icon name="done-all" size={12} color="white" />);
    case STATUS.READ:
      return (<Icon name="done-all" size={12} color="#ffeb3b" />);
  }

  return (null);
}
