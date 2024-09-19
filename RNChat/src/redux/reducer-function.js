const getUpdatedDialogs = (updatedDialog, dialogs) => {
  const updatedDialogs = dialogs.map(dialog =>
    dialog.id === updatedDialog.id
      ? Object.assign(dialog, updatedDialog)
      : dialog);

  return [...updatedDialogs];
};

const getLazyFetchMessages = ({ dialogId, messages }, history) => {
  const mergeMessages = history[dialogId].concat(messages);
  return Object.assign({}, history, { [dialogId]: mergeMessages });
};

const getSortedDialogs = ({ message, count }, dialogs) => {
  const updatedDialogs = dialogs.map(elem => {
    if (elem.id === message.dialog_id) {
      const newObj = {
        last_message: message.body,
        last_message_date_sent: message.date_sent,
        updated_date: message.date_sent,
        unread_messages_count: count ? elem.unread_messages_count += 1 : elem.unread_messages_count,
      };
      return Object.assign(elem, newObj);
    } return elem;
  });

  const sort = (items, inverted = false) => items.sort((itemA, itemB) => {
    const result = new Date(itemB.last_message_date_sent * 1000) - new Date(itemA.last_message_date_sent * 1000);
    return inverted ? !result : result;
  });

  const result = sort(updatedDialogs);

  return [...result];
};

const updateStatusMessages = ({ dialogId, messageId, sendState }, messages) => {
  if (Object.keys(messages).length === 0) {
    return messages;
  }

  let isBreak = true;
  const history = messages[dialogId];
  const updatedMessages = history.map(message => {
    if (message.id === messageId) {
      isBreak = false;
      return Object.assign({}, message, { send_state: sendState });
    } else if (isBreak) {
      return Object.assign({}, message, { send_state: sendState });
    }
    return message;
  });

  return Object.assign({}, messages, { [dialogId]: updatedMessages });
};

const getFetchedUsers = (newUsers, users) => {
  const newObjUsers = {};
  newUsers.forEach(user => {
    newObjUsers[user.id] = user;
  });
  return Object.assign({}, users, newObjUsers);
};

export {
  getUpdatedDialogs,
  getSortedDialogs,
  getFetchedUsers,
  getLazyFetchMessages,
  updateStatusMessages,
};
