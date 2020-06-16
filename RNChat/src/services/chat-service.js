import React, { useContext } from 'react';
import ConnectyCube from 'react-native-connectycube';
import { AppState } from 'react-native';

import Dialog from '../models/dialogs';
import { fetchDialogs, sortDialogs, updateDialog, addNewDialog, deleteDialog } from '../actions/dialogs';
import { pushMessage, fetchMessages, lazyFetchMessages, updateMessages, deleteAllMessages } from '../actions/messages';
import { selectDialog, unselectDialog } from '../actions/selectedDialog';
import { fetchUsers } from '../actions/users';
import {
  Message,
  STATUS_DELIVERED,
  STATUS_READ,
  STATUS_SENT,
} from '../models/message';
import { FakeMessage } from '../models/fakemessage';
import UserModel from '../models/user';
import { preparationUploadImg, preparationAttachment } from '../helpers/file';
import { DIALOG_TYPE } from '../helpers/constants';
import GlobalContext from '../store';

const ChatContext = React.createContext();

export default ChatContext;

const ChatProvider = ({ children }) => {
  const { store, dispatch } = useContext(GlobalContext);
  const currentUser = store.currentUser?.user;

  const setUpListeners = () => {
    ConnectyCube.chat.onMessageListener = onMessageListener;
    ConnectyCube.chat.onSentMessageCallback = onSentMessageListener;
    ConnectyCube.chat.onDeliveredStatusListener = onDeliveredStatus;
    ConnectyCube.chat.onReadStatusListener = onReadStatus;
    /* OR
    ConnectyCube.chat.onMessageListener.bind(onMessageListener);
    ConnectyCube.chat.onSentMessageCallback.bind(onSentMessageListener);
    ConnectyCube.chat.onDeliveredStatusListener.bind(onDeliveredStatus);
    ConnectyCube.chat.onReadStatusListener.bind(onReadStatus);
    */
    AppState.addEventListener('change', handleAppStateChange);
  };

  const fetchDialogsFromServer = async () => {
    const dialogsFromServer = await ConnectyCube.chat.dialog.list();
    const currentUserId = currentUser;
    const privatChatIdsUser = [];

    const dialogs = dialogsFromServer.items.map(elem => {
      if (elem.type === DIALOG_TYPE.PRIVATE) {
        elem.occupants_ids.forEach(elem => {
          elem != currentUserId.id && privatChatIdsUser.push(elem);
        });
      }
      return new Dialog(elem);
    });

    if (privatChatIdsUser.length !== 0) {
      const usersInfo = await getUsersList(privatChatIdsUser);
      dispatch(fetchUsers(usersInfo));
    }

    dispatch(fetchDialogs(dialogs));
  };

  const getUsersList = async (ids) => {
    const usersList = await ConnectyCube.users.get({
      per_page: 100,
      filter: {
        field: 'id', param: 'in', value: ids,
      },
    });

    return usersList.items.map(elem => new UserModel(elem.user));
  };

  const sendMessage = async (dialog, messageText, attachments = false) => {
    const user = currentUser;
    const text = messageText.trim();
    const date = Math.floor(Date.now() / 1000);
    const recipient_id = dialog.type === DIALOG_TYPE.PRIVATE ? dialog.occupants_ids.find(elem => elem != user.id)
      : dialog.xmpp_room_jid;

    const msg = {
      type: dialog.xmpp_type,
      body: text,
      extension: {
        save_to_history: 1,
        dialog_id: dialog.id,
        sender_id: user.id,
        date_sent: date,
      },
      markable: 1,
    };

    msg.id = messageUniqueId();

    // If send message as Attachment
    if (attachments) {
      return sendMessageAsAttachment(dialog, recipient_id, msg, attachments);
    }

    const message = new FakeMessage(msg);
    dispatch(pushMessage(message, dialog.id));
    await ConnectyCube.chat.send(recipient_id, msg);
    dispatch(sortDialogs(message));
  };

  const sendMessageAsAttachment = async (dialog, recipient_id, msg, attachments) => {
    // create fake data for render img
    const attachment = preparationAttachment(attachments);
    msg.extension.attachments = [attachment];
    msg.body = 'Image attachment';
    const message = new FakeMessage(msg);
    dispatch(pushMessage(message, dialog.id));

    // create real data for attachment
    const response = await uploadPhoto(attachments);
    const updateAttach = preparationAttachment(attachments, response.uid);
    msg.extension.attachments = [updateAttach];
    await ConnectyCube.chat.send(recipient_id, msg);
    dispatch(sortDialogs(message));
  };

  const updateDialogsUnreadMessagesCount = (dialog) => {
    const updateObj = Object.assign(dialog, { unread_messages_count: 0 });
    dispatch(updateDialog(updateObj));
    return true;
  };

  const getMessages = async (dialog) => {
    setSelectedDialog(dialog.id);
    const user = currentUser;
    const isAlredyUpdate = getMessagesByDialogId(dialog.id);
    let amountMessages = null;

    // If the first entry into the chat

    if (!dialog.isAlreadyMessageFetch || dialog.unread_messages_count > 0 && !dialog.isAlreadyMessageFetch) {
      const historyFromServer = await ConnectyCube.chat.message.list({
        chat_dialog_id: dialog.id,
        sort_desc: 'date_sent',
      });
      const messages = historyFromServer.items.map(elem => (
        new Message(elem, user.id)
      ));
      const newObj = Object.assign(dialog, { isAlreadyMessageFetch: true });
      if (dialog.unread_messages_count > 0) {
        const firstUnreadMsg = messages[dialog.unread_messages_count - 1];
        readAllMessages(dialog.id);
        sendReadStatus(firstUnreadMsg.id, firstUnreadMsg.sender_id, firstUnreadMsg.dialog_id);
      }
      updateDialogsUnreadMessagesCount(newObj);
      dispatch(fetchMessages(dialog.id, messages));
      amountMessages = messages.length;
    } else {
      // If the second entry into the chat

      if (dialog.unread_messages_count > 0) {
        const messages = getMessagesByDialogId(dialog.id);
        const firstUnreadMsg = messages[dialog.unread_messages_count - 1];
        readAllMessages(dialog.id);
        await sendReadStatus(firstUnreadMsg.id, firstUnreadMsg.sender_id, firstUnreadMsg.dialog_id);
        updateDialogsUnreadMessagesCount(dialog);
      }
      amountMessages = isAlredyUpdate.length;
    }
    return amountMessages;
  };

  // Message loading if more than 100
  const getMoreMessages = async (dialog) => {
    const currentMessages = getMessagesByDialogId(dialog.id);
    const lastMessageDate = currentMessages[currentMessages.length - 1];
    const updateObj = Object.assign(dialog, { last_messages_for_fetch: lastMessageDate.date_sent });

    const filter = {
      chat_dialog_id: dialog.id,
      date_sent: { lt: lastMessageDate.date_sent },
      sort_desc: 'date_sent',
    };

    const moreHistoryFromServer = await ConnectyCube.chat.message.list(filter);
    const messages = moreHistoryFromServer.items.map(elem => new Message(elem));
    dispatch(updateDialog(updateObj));
    const amountMessages = dispatch(lazyFetchMessages(dialog.id, messages));
    return amountMessages.history.length;
  };

  const onMessageListener = (senderId, msg) => {
    const message = new Message(msg);
    const user = currentUser;
    const dialog = getSelectedDialog();
    if (senderId !== user.id) {
      if (dialog === message.dialog_id) {
        dispatch(sortDialogs(message));
        readMessage(message.id, message.dialog_id);
        sendReadStatus(msg.extension.message_id, msg.extension.sender_id, msg.dialog_id);
      } else {
        sendDeliveredStatus(msg.extension.message_id, msg.extension.sender_id, msg.dialog_id);
        dispatch(sortDialogs(message, true));
      }
      dispatch(pushMessage(message, message.dialog_id));
    }
  };

  const readAllMessages = async (dialogId) =>
    ConnectyCube.chat.message.update(null, {
      chat_dialog_id: dialogId,
      read: 1,
    });

  const readMessage = async (messageId, dialogId) => {
    onReadStatus(messageId, dialogId);
    return ConnectyCube.chat.message.update(null, {
      chat_dialog_id: dialogId,
      read: 1,
    });
  };

  const createPrivateDialog = async (userId) => {
    const { dialogs } = store;
    let dialog = null;

    dialogs.forEach(elem => {
      if (elem.type === DIALOG_TYPE.PRIVATE && elem.occupants_ids.find(elem => elem === userId)) {
        dialog = elem;
      }
    });

    if (!dialog) {
      const params = {
        type: DIALOG_TYPE.PRIVATE,
        occupants_ids: userId,
      };
      const response = await ConnectyCube.chat.dialog.create(params);
      dialog = new Dialog(response);
      if (getUserFromReduxById(userId)) {
        dispatch(addNewDialog(dialog));
        return dialog;
      }
      const usersInfo = await getUserFromServerById(userId);
      usersInfo.user = new UserModel(usersInfo.user);
      dispatch(fetchUsers([usersInfo.user]));
      dispatch(addNewDialog(dialog));
      return dialog;
    }

    // If the user is already in the Redux
    if (getUserFromReduxById(userId)) {
      return dialog;
    }
    const usersInfo = await getUserFromServerById(userId);
    usersInfo.user = new UserModel(usersInfo.user);
    dispatch(fetchUsers([usersInfo.user]));
    return dialog;
  };

  const createPublicDialog = async (occupants_ids, groupName, img) => {
    occupants_ids.unshift(currentUser.id);

    const params = {
      type: DIALOG_TYPE.GROUP,
      occupants_ids,
      name: groupName,
    };

    const image = img ? await uploadPhoto(img) : null;
    if (image) {
      params.photo = image.uid;
    }

    const dialog = await ConnectyCube.chat.dialog.create(params);
    const newDialog = new Dialog(dialog);
    dispatch(addNewDialog(newDialog));
    return newDialog;
  };

  const uploadPhoto = async (params) => {
    const file = preparationUploadImg(params);
    return ConnectyCube.storage.createAndUpload({ file });
  };

  const updateDialogInfo = async ({ img, name, dialogId }) => {
    const params = {};
    const image = img ? await uploadPhoto(img) : null;
    if (image) {
      params.photo = image.uid;
    }
    if (name) {
      params.name = name;
    }
    const response = await ConnectyCube.chat.dialog.update(dialogId, params);
    const updateData = new Dialog(response);
    dispatch(updateDialog(updateData));
  };

  const deleteDialogMethod = async (dialogId) => {
    await ConnectyCube.chat.dialog.delete(dialogId);
    dispatch(deleteAllMessages(dialogId));
    dispatch(deleteDialog(dialogId));
  };

  const addOccupantsToDialog = async (dialog_id, occupants) => {
    const participantIds = occupants.map(elem => elem.id);
    const params = {
      push_all: { occupants_ids: participantIds },
    };
    const response = await ConnectyCube.chat.dialog.update(dialog_id, params);
    const updateData = new Dialog(response);
    dispatch(fetchUsers(occupants));
    dispatch(updateDialog(updateData));
    return updateData;
  };

  const handleAppStateChange = (AppState) => {
    if (AppState === 'active') {
      ConnectyCube.chat.markActive();
    } else {
      ConnectyCube.chat.markInactive();
    }
  };

  // ConnectyCube listeners
  const onSentMessageListener = (failedMessage, msg) => {
    if (failedMessage) {
      return;
    }
    dispatch(updateMessages(msg.extension.dialog_id, msg.id, { send_state: STATUS_SENT }));
  };

  // ConnectyCube listeners
  const onDeliveredStatus = (messageId, dialogId, userId) => {
    dispatch(updateMessages(dialogId, messageId, { send_state: STATUS_DELIVERED }));
  };

  // ConnectyCube listeners
  const onReadStatus = (messageId, dialogId, userId) => {
    dispatch(updateMessages(dialogId, messageId, { send_state: STATUS_READ }));
  };

  const sendReadStatus = (messageId, userId, dialogId) => {
    ConnectyCube.chat.sendReadStatus({ messageId, userId, dialogId });
  };

  const sendDeliveredStatus = (messageId, userId, dialogId) => {
    ConnectyCube.chat.sendDeliveredStatus({ messageId, userId, dialogId });
  };

  const pushMessageToStore = (dialogId, messages) => {
    dispatch(pushMessage(dialogId, messages.map(message => new Message(message))));
  };

  const getDialogById = (dialogId) => store.dialogs.find(elem => elem.id === dialogId);

  const getMessagesByDialogId = (dialogId) => {
    const result = store.messages;
    return result[dialogId];
  };

  const isGroupCreator = (user_id) => user_id === currentUser.id;

  const getUserFromServerById = async (id) => ConnectyCube.users.get(id);

  const getUserFromReduxById = (id) => store.users[id];

  const getSelectedDialog = () => store.selectedDialog;

  const setSelectedDialog = (dialogId) => {
    dispatch(selectDialog(dialogId));
  };

  const resetSelectedDialogs = () => {
    dispatch(unselectDialog());
  };

  const messageUniqueId = () => ConnectyCube.chat.helpers.getBsonObjectId();

  return (
    <ChatContext.Provider
      value={{
        setUpListeners,
        fetchDialogsFromServer,
        getUsersList,
        sendMessage,
        sendMessageAsAttachment,
        updateDialogsUnreadMessagesCount,
        getMessages,
        getMoreMessages,
        onMessageListener,
        readAllMessages,
        readMessage,
        createPrivateDialog,
        createPublicDialog,
        uploadPhoto,
        updateDialogInfo,
        deleteDialog: deleteDialogMethod,
        addOccupantsToDialog,
        handleAppStateChange,
        onSentMessageListener,
        onDeliveredStatus,
        onReadStatus,
        sendReadStatus,
        sendDeliveredStatus,
        pushMessageToStore,
        getDialogById,
        getMessagesByDialogId,
        isGroupCreator,
        getUserFromServerById,
        getUserFromReduxById,
        getSelectedDialog,
        setSelectedDialog,
        resetSelectedDialogs,
        messageUniqueId,
        dialogs: store.dialogs || [],
        messages: store.messages || {},
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export { ChatProvider };
