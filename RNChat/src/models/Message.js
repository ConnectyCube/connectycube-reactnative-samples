import Contacts from '../services/ContactsDataService'

const defaultMessage = {
	id: '',
	body: '',
	dialog_id: '',
	date_sent: Math.floor(Date.now() / 1000),
	attachments: null,
	sender_id: null,
	sender: null
}

export default class Message {
	constructor(msg = defaultMessage) {
		this.id = msg.id || msg._id 
		this.body = msg.body || msg.message 
		this.dialog_id = msg.chat_dialog_id || (msg.extension && msg.extension.dialog_id)
		this.date_sent = msg.date_sent || (msg.extension && msg.extension.date_sent) || Math.floor(Date.now() / 1000)
		this.attachment = Message.getAttachment(msg)
		this.sender_id = msg.sender_id || (msg.extension && msg.extension.sender_id)
		this.sender = this.getSender(msg)
	}

	getSender(msg = null) {
		let id = msg.sender_id || (msg.extension && msg.extension.sender_id)
		return id && Contacts.get(id)
	}

	static getAttachment(msg) {
		return (
			(msg.extension && msg.extension.attachments && msg.extension.attachments[0]) ||
			(msg.attachments && msg.attachments[0]) ||
			msg.attachment
		)
	}
}
