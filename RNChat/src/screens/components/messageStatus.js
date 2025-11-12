import React from 'react';
import { Check, CheckCheck, Clock } from 'lucide-react-native';
import { STATUS } from '../../models/message';

export default function MessageStatus({ send_state }) {
  switch (send_state) {
    case STATUS.PENDING:
      return (<Clock size={12} color="white" />);
    case STATUS.SENT:
      return (<Check size={12} color="white" />);
    case STATUS.DELIVERED:
      return (<CheckCheck size={12} color="white" />);
    case STATUS.READ:
      return (<CheckCheck size={12} color="#ffeb3b" />);;
  }

  return (null);
}
