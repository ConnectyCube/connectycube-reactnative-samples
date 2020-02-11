const updateDialog = (action, dialogs) => {
  const alreadyUpdatedDialog = dialogs.map(elem => {
    if (elem.id === action.dialog.id) {
      return Object.assign(elem, action.dialog)
    } return elem
  })
  return [...alreadyUpdatedDialog]
}

const lazyFetchMessages = (action, messages) => {
  const mergeMessages = messages[action.dialogId].concat(action.history)
  return { ...{}, [action.dialogId]: mergeMessages }
}

const sortedDialog = (action, dialogs) => {
  const { message, count } = action
  const updateDialog = dialogs.map(elem => {
    if (elem.id === message.dialog_id) {
      const newObj = {
        last_message: message.body,
        last_message_date_sent: message.date_sent,
        updated_date: message.date_sent,
        unread_messages_count: count ? elem.unread_messages_count += 1 : elem.unread_messages_count
      }
      return Object.assign(elem, newObj)
    } return elem
  })

  const sort = (items, inverted = false) => items.sort((itemA, itemB) => {
    const result = new Date(itemB.last_message_date_sent * 1000) - new Date(itemA.last_message_date_sent * 1000)
    return inverted ? !result : result
  })


  const result = sort(updateDialog)

  return [...result]
}

const updateStatusMessages = (action, message) => {
  if (Object.keys(message).length == 0) {
    return message
  }

  let isBreak = true
  const newMessages = message[action.dialogId].map((elem, index) => {
    if (elem.id === action.msgId) {
      isBreak = false
      return Object.assign(elem, action.msg)
    } else if (isBreak) {
      return Object.assign(elem, action.msg)
    }
    return elem
  })

  const result = { ...message, [action.dialogId]: newMessages }

  return result
}

const fetchUsers = (action, users) => {
  const newObjUsers = {}
  action.forEach(elem => {
    newObjUsers[elem.id] = elem
  })
  return { ...users, ...newObjUsers }
}

export {
  updateDialog,
  lazyFetchMessages,
  sortedDialog,
  updateStatusMessages,
  fetchUsers
}