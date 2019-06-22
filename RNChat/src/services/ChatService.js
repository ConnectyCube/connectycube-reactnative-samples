import ConnectyCube from 'connectycube-reactnative'
import Dialog from '../models/Dialog'
import Message from '../models/Message'
import User from './UserService'
import Contacts from './ContactsDataService'
import CurrentUser from './CurrentUserDataService'

class ChatService {
	// Chat - Core
	connect(user, dialogs) {
		return new Promise((resolve, reject) => {
			if (!user) reject()

			ConnectyCube.chat.connect({
				userId: user.id,
				password: user.password
			},(error, contacts) => {
				if (!error && contacts) {
					if (dialogs) {
						this.joinToAllConversations(dialogs)
					}
					resolve(contacts)
				} else {
					reject(error)
				}
			})
		})
	}

	disonnect() {
		ConnectyCube.chat.disconnect()
	}

	// Chat - Dialogs
	getConversations() {
		return new Promise((resolve, reject) => {
			ConnectyCube.chat.dialog.list({ sort_desc: 'updated_at' }, (error, result) => {
				if (!error && result) {
					const items = result.items

					let dialogs = [],
						contactsIds = []

					for (let i = 0; i < items.length; i++) {
						if (items[i].type === 1) continue

						let dialog = new Dialog(items[i])

						if (dialog.type === 3) {
							dialog.destination = ConnectyCube.chat.helpers.getRecipientId(
								dialog.occupants_ids,
								CurrentUser.getProp('id'),
							)
						} else {
							dialog.destination = dialog.room_jid
						}

						contactsIds = [...new Set(contactsIds.concat(dialog.occupants_ids))]
						dialogs.push(dialog)
					}

					if (contactsIds.length) {
						User.listUsersByIds(contactsIds).then(Contacts.set)
					}

					resolve(dialogs)
				} else if (error.code === 404) {
					resolve([])
				} else {
					reject(error)
				}
			})
		})
	}

	createConversation(params) {
		return new Promise((resolve, reject) => {
			ConnectyCube.chat.dialog.create(params, (error, conversation) => {
				if (!error && conversation) {
					let dialog = new Dialog(conversation)

					if (dialog.type === 3) {
						dialog.destination = ConnectyCube.chat.helpers.getRecipientId(
							dialog.occupants_ids,
							CurrentUser.getProp('id'),
						)
					} else {
						ConnectyCube.chat.muc.join(dialog.room_jid)
						dialog.destination = dialog.room_jid
					}

					resolve(dialog)
				} else {
					reject(error)
				}
			})
		})
	}

	joinToAllConversations(dialogs) {
		for (let dialog of dialogs) {
			if (dialog.type !== 3) {
				ConnectyCube.chat.muc.join(dialog.room_jid)
			}
		}
	}

	// Chat - Messages
	getHistory(dialogId) {
		return new Promise((resolve, reject) => {
			ConnectyCube.chat.message.list({
				chat_dialog_id: dialogId,
				sort_desc: 'date_sent'
			}, (error, result) => {
				if (!error) {
					let history = []
					const messages = result.items

					for (let i = 0; i < messages.length; i++) {
						history.push(new Message(messages[i]))
					}

					this.readAllMessages(dialogId)

					resolve(history.reverse())
				} else {
					reject(error)
				}
			})
		})
	}

	readMessage(id, dialogId) {
		ConnectyCube.chat.message.update(id, {
			chat_dialog_id: dialogId,
			read: 1
		}, error => {
			return new Promise((resolve, reject) => {
				// error ? reject(error) : resolve()
				resolve()
			})
		})
	}

	readAllMessages(dialogId) {
		ConnectyCube.chat.message.update(null, {
			chat_dialog_id: dialogId,
			read: 1
		}, error => {
			return new Promise((resolve, reject) => {
				// error ? reject(error) : resolve()
				resolve()
			})
		})
	}
}

// create instance
const Chat = new ChatService()

// lock instance
Object.freeze(Chat)

export default Chat
