import { getImageLinkFromUID } from '../helpers/file';

export const STATUS = {
	PENDING: 0,
	SENT: 1,
	DELIVERED: 2,
	READ: 3,
};

const defaultMessage = {
	id: '',
	body: '',
	dialog_id: '',
	date_sent: Math.floor(Date.now() / 1000),
	attachments: null,
	sender_id: null,
	sender: null,
};

export class Message {
	constructor(msg = defaultMessage, currentUser) {
		this.id = msg.id || msg._id;
		this.body = msg.body || msg.message;
		this.dialog_id = msg.chat_dialog_id || (msg.extension && msg.extension.dialog_id);
		this.date_sent = msg.date_sent || (msg.extension && msg.extension.date_sent) || Math.floor(Date.now() / 1000);
		this.send_state = Message.getSendState(msg, currentUser);
		this.attachment = Message.getAttachment(msg);
		this.sender_id = msg.sender_id || (msg.extension && msg.extension.sender_id);
		this.sender = msg.sender_id;
	}

	static getAttachment(msg) {
		if (msg.attachments && msg.attachments.length > 0) {
			const attachments = { ...msg.attachments[0] };
			const parseLink = getImageLinkFromUID(msg.attachments[0].uid);
			attachments.url = parseLink;
			return [attachments];
		} else if (msg?.extension?.attachments && msg.extension.attachments.length > 0) {
			const attachments = { ...msg.extension.attachments[0] };
			const parseLink = getImageLinkFromUID(msg.extension.attachments[0].uid);
			attachments.url = parseLink;
			return [attachments];
		} else { return null; }
	}

	static getSendState(msg, currentUser) {
		if (msg?.read_ids?.find(_id => _id !== currentUser)) {
			return STATUS.READ;
		}
		if (msg?.delivered_ids?.find(msg => msg.delivered_ids !== currentUser)) {
			return STATUS.DELIVERED;
		}
		return STATUS.PENDING;
	}

}

export class FakeMessage {
	constructor(msg) {
		this.attachment = msg.extension.attachments;
		this.body = msg.body;
		this.date_sent = msg.extension.date_sent;
		this.dialog_id = msg.extension.dialog_id;
		this.id = msg.id;
		this.send_state = 0;
		this.sender = undefined;
		this.sender_id = msg.extension.sender_id;
	}
}
