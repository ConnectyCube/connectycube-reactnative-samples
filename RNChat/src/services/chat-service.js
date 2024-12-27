import ConnectyCube from 'react-native-connectycube';
import Dialog from '../models/dialogs';
import { AppState } from 'react-native';
import { fetchDialogs, sortDialogs, updateDialog, addNewDialog, deleteDialog } from '../redux/slices/dialogs';
import { pushMessage, fetchMessages, lazyFetchMessages, updateMessages, clearMessages } from '../redux/slices/messages';
import { selectDialog, unselectDialog } from '../redux/slices/selectedDialog';
import { fetchUsers } from '../redux/slices/users';
import store from '../redux/store';
import { Message, FakeMessage } from '../models/message';
import UserModel from '../models/user';
import { preparationUploadImg, preparationAttachment } from '../helpers/file';
import { DIALOG_TYPE } from '../helpers/constants';
import { STATUS } from '../models/message';

class ChatService {
  constructor() {
    if (ChatService.instance) {
      return ChatService.instance;
    }

    ChatService.instance = this;
  }

  setUpListeners() {
    ConnectyCube.chat.onMessageListener = this.onMessageListener.bind(this);
    ConnectyCube.chat.onSentMessageCallback = this.onSentMessageListener.bind(this);
    ConnectyCube.chat.onDeliveredStatusListener = this.onDeliveredStatus.bind(this);
    ConnectyCube.chat.onReadStatusListener = this.onReadStatus.bind(this);
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  async connect(userId, password) {
    this.setUpListeners();
    await ConnectyCube.chat.connect({ userId, password });
  }

  async disconnect() {
    await ConnectyCube.chat.disconnect();
  }

  async fetchDialogsFromServer() {
    const dialogsFromServer = await ConnectyCube.chat.dialog.list();
    let privateChatIdsUser = [];

    const dialogs = dialogsFromServer.items.map(dialog => {
      if (dialog.type === DIALOG_TYPE.PRIVATE) {
        dialog.occupants_ids.forEach(occupantId => {
          if (occupantId !== this.currentUser?.id) {
            privateChatIdsUser.push(occupantId);
          }
        });
      }
      return new Dialog(dialog);
    });

    if (privateChatIdsUser.length !== 0) {
      const usersInfo = await this.getUsersList(privateChatIdsUser);
      store.dispatch(fetchUsers(usersInfo));
    }

    store.dispatch(fetchDialogs(dialogs));
  }

  async getUsersList(ids) {
    const usersList = await ConnectyCube.users.getV2({
      limit: 100,
      offset: 0,
      id: { in: ids },
    });

    return usersList.items.map(user => {
      return new UserModel(user);
    });
  }

  async sendMessage(dialog, messageText, attachments = false) {
    const user = this.currentUser;
    const text = messageText.trim();
    const date = Math.floor(Date.now() / 1000);
    const recipient_id = dialog.type === DIALOG_TYPE.PRIVATE ? dialog.occupants_ids.find(elem => elem != user?.id)
      : dialog.xmpp_room_jid;

    let msg = {
      type: dialog.xmpp_type,
      body: text,
      extension: {
        save_to_history: 1,
        dialog_id: dialog.id,
        sender_id: user?.id,
        date_sent: date,
      },
    };

    msg.id = this.messageUniqueId;

    // If send message as Attachment
    if (attachments) {
      return this.sendMessageAsAttachment(dialog, recipient_id, msg, attachments);
    }

    const message = new FakeMessage(msg);
    store.dispatch(pushMessage({ message, dialogId: dialog.id }));
    ConnectyCube.chat.send(recipient_id, msg);
    store.dispatch(sortDialogs({ message }));
  }

  async sendMessageAsAttachment(dialog, recipient_id, msg, attachments) {
    //create fake data for render img
    const attachment = preparationAttachment(attachments);
    msg.extension.attachments = [attachment];
    msg.body = 'Image attachment';
    const message = new FakeMessage(msg);
    store.dispatch(pushMessage({ message, dialogId: dialog.id }));

    // create real data for attachment
    const response = await this.uploadPhoto(attachments);
    const updateAttach = preparationAttachment(attachments, response.uid);
    msg.extension.attachments = [updateAttach];
    ConnectyCube.chat.send(recipient_id, msg);
    store.dispatch(sortDialogs({ message }));
    return;
  }

  updateDialogsUnreadMessagesCount = (dialog) => {
    const updateObj = Object.assign(dialog, { unread_messages_count: 0 });
    store.dispatch(updateDialog(updateObj));
    return true;
  };

  async getMessagesAndStore(dialog) {
    this.setSelectedDialog(dialog.id);
    const isAlreadyUpdate = this.getMessagesByDialogId(dialog.id);
    let amountMessages = null;
    // If the first entry into the chat
    if (!dialog.isAlreadyMessageFetch || dialog.unread_messages_count > 0 && !dialog.isAlreadyMessageFetch) {
      const historyFromServer = await ConnectyCube.chat.message.list({
        chat_dialog_id: dialog.id,
        sort_desc: 'date_sent',
      });
      const messages = historyFromServer.items.map(message => (
        new Message(message, this.currentUser?.id)
      ));
      const newObj = Object.assign(dialog, { isAlreadyMessageFetch: true });
      if (dialog.unread_messages_count > 0) {
        const firstUnreadMsg = messages[dialog.unread_messages_count - 1];
        this.readAllMessages(dialog.id);
        this.sendReadStatus(firstUnreadMsg.id, firstUnreadMsg.sender_id, firstUnreadMsg.dialog_id);
      }
      this.updateDialogsUnreadMessagesCount(newObj);
      store.dispatch(fetchMessages({ dialogId: dialog.id, messages }));
      amountMessages = messages.length;
    } else {
      // If the second entry into the chat
      if (dialog.unread_messages_count > 0) {
        const messages = this.getMessagesByDialogId(dialog.id);
        const firstUnreadMsg = messages[dialog.unread_messages_count - 1];
        this.readAllMessages(dialog.id);
        await this.sendReadStatus(firstUnreadMsg.id, firstUnreadMsg.sender_id, firstUnreadMsg.dialog_id);
        this.updateDialogsUnreadMessagesCount(dialog);
      }
      amountMessages = isAlreadyUpdate.length;
    }
    return amountMessages;
  }

  // Message loading if more than 100
  getMoreMessages = async (dialog) => {
    const currentMessages = this.getMessagesByDialogId(dialog.id);
    const lastMessageDate = currentMessages[currentMessages.length - 1];
    const updateObj = Object.assign(dialog, { last_messages_for_fetch: lastMessageDate.date_sent });

    const filter = {
      chat_dialog_id: dialog.id,
      date_sent: { lt: lastMessageDate.date_sent },
      sort_desc: 'date_sent',
    };

    const moreHistoryFromServer = await ConnectyCube.chat.message.list(filter);
    const messages = moreHistoryFromServer.items.map(elem => new Message(elem));
    store.dispatch(updateDialog(updateObj));
    const amountMessages = store.dispatch(lazyFetchMessages({ dialogId: dialog.id, messages }));
    return amountMessages.history.length;
  };

  async onMessageListener(senderId, msg) {
    const message = new Message(msg);

    message.sender_id = senderId;

    if (senderId !== this.currentUser?.id) {
      const selectedDialogId = this.getSelectedDialog();

      if (selectedDialogId === message.dialog_id) {
        store.dispatch(sortDialogs({ message }));
        this.readMessage(message.id, message.dialog_id);
        this.sendReadStatus(message.id, message.sender_id, message.dialog_id);
      } else {
        this.sendDeliveredStatus(message.id, message.sender_id, message.dialog_id);
        store.dispatch(sortDialogs({ message, count: true }));
      }

      const dialog = this.getDialogById(message.dialog_id);

      if (dialog) {
        store.dispatch(pushMessage({ message }));
      } else {
        await this.fetchDialogById(message.dialog_id);
      }
    }
  }

  async readAllMessages(dialogId) {
    return ConnectyCube.chat.message.update(null, {
      chat_dialog_id: dialogId,
      read: 1,
    });
  }

  async readMessage(messageId, dialogId) {
    this.onReadStatus(messageId, dialogId);
    return ConnectyCube.chat.message.update(null, {
      chat_dialog_id: dialogId,
      read: 1,
    });
  }

  async createPrivateDialog(userId) {
    const dialogs = store.getState().dialogs;
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
      if (this.getUserFromReduxById(userId)) {
        store.dispatch(addNewDialog(dialog));
        return dialog;
      } else {
        const user = await this.getUserFromServerById(userId);
        store.dispatch(fetchUsers([user]));
        store.dispatch(addNewDialog(dialog));
        return dialog;
      }
    }

    // If the user is already in the Redux
    if (this.getUserFromReduxById(userId)) {
      return dialog;
    } else {
      const user = await this.getUserFromServerById(userId);
      store.dispatch(fetchUsers([user]));
      return dialog;
    }
  }

  async createGroupDialog(occupants_ids, groupName, img) {
    occupants_ids.unshift(this.currentUser?.id);

    const params = {
      type: DIALOG_TYPE.GROUP,
      occupants_ids,
      name: groupName,
    };

    const image = img ? await this.uploadPhoto(img) : null;
    if (image) {
      params.photo = image.uid;
    }

    const dialog = await ConnectyCube.chat.dialog.create(params);
    const newDialog = new Dialog(dialog);
    store.dispatch(addNewDialog(newDialog));
    const users = await this.getUsersList(occupants_ids);
    store.dispatch(fetchUsers(users));
    return newDialog;
  }

  async uploadPhoto(params) {
    const file = preparationUploadImg(params);
    const { type, name, size } = file;
    return ConnectyCube.storage.createAndUpload({ file, type, name, size, public: true });
  }

  async updateDialog({ photo, name, dialogId }) {
    const params = {};
    const image = photo ? await this.uploadPhoto(photo) : null;
    if (image) {
      params.photo = image.uid;
    }
    if (name) {
      params.name = name;
    }
    const response = await ConnectyCube.chat.dialog.update(dialogId, params);
    const updateData = new Dialog(response);
    store.dispatch(updateDialog(updateData));
  }

  async deleteDialog(dialogId) {
    await ConnectyCube.chat.dialog.delete(dialogId);
    store.dispatch(clearMessages(dialogId));
    store.dispatch(deleteDialog(dialogId));
  }

  async addOccupantsToDialog(dialog_id, occupants) {
    const participantIds = occupants.map(elem => elem.id);
    const params = {
      push_all: { occupants_ids: participantIds },
    };
    const response = await ConnectyCube.chat.dialog.update(dialog_id, params);
    const updateData = new Dialog(response);
    store.dispatch(fetchUsers(occupants));
    store.dispatch(updateDialog(updateData));
    return updateData;
  }

  handleAppStateChange = (state) => {
    if (state === 'active') {
      ConnectyCube.chat.markActive();
    } else {
      ConnectyCube.chat.markInactive();
    }
  };

  // ConnectyCube listeners
  onSentMessageListener(failedMessage, msg) {
    console.log({ failedMessage, msg });
    if (failedMessage) {
      return;
    }
    const dialogId = msg.extension.dialog_id;
    const messageId = msg.id;
    store.dispatch(updateMessages({ dialogId, messageId, sendState: STATUS.SENT }));
  }

  // ConnectyCube listeners
  onDeliveredStatus(messageId, dialogId, _userId) {
    store.dispatch(updateMessages({ dialogId, messageId, sendState: STATUS.DELIVERED }));
  }

  // ConnectyCube listeners
  onReadStatus(messageId, dialogId, _userId) {
    store.dispatch(updateMessages({ dialogId, messageId, sendState: STATUS.READ }));
  }

  sendReadStatus(messageId, userId, dialogId) {
    ConnectyCube.chat.sendReadStatus({ messageId, userId, dialogId });
  }

  sendDeliveredStatus(messageId, userId, dialogId) {
    ConnectyCube.chat.sendDeliveredStatus({ messageId, userId, dialogId });
  }

  getDialogById(dialogId) {
    return store.getState().dialogs.find(elem => elem.id === dialogId);
  }

  async fetchDialogById(dialogId, reduxFirst = false) {
    if (reduxFirst) {
      const storedDialog = this.getDialogById(dialogId);

      if (storedDialog) {
        return storedDialog;
      }
    }

    // get Dialog from server
    const filters = { _id: { in: dialogId } };
    const dialogsFromServer = await ConnectyCube.chat.dialog.list(filters);
    const dialog = new Dialog(dialogsFromServer.items[0]);
    // get Dialog occupants from server
    const currentUserId = this.currentUser?.id;
    const occupantsIds = dialog.occupants_ids.filter(occupantId => occupantId !== currentUserId);
    const users = await this.getUsersList(occupantsIds);
    store.dispatch(fetchUsers(users));
    store.dispatch(addNewDialog(dialog));
    return dialog;
  }

  getMessagesByDialogId(dialogId) {
    const result = store.getState().messages;
    return result[dialogId];
  }

  isGroupCreator(user_id) {
    return user_id === this.currentUser?.id ? true : false;
  }

  async getUserFromServerById(id) {
    return ConnectyCube.users.get(id).then(response => new UserModel(response.user));
  }

  getUserFromReduxById(id) {
    return store.getState().users[id];
  }

  getSelectedDialog = () => {
    return store.getState().selectedDialog;
  };

  setSelectedDialog = (dialogId) => {
    store.dispatch(selectDialog(dialogId));
  };

  resetSelectedDialogs() {
    store.dispatch(unselectDialog());
  }

  get currentUser() {
    return store.getState().currentUser?.user;
  }

  get messageUniqueId() {
    return ConnectyCube.chat.helpers.getBsonObjectId();
  }
}

export default new ChatService();
