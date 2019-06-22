const defaultDialog = {
	id: '',
	type: '',
	xmpp_type: '',
	room_jid: '',
	name: 'Unknown',
	photo: null,
	description: '',
	destination: null,
	user_id: 0,
	admins_ids: [],
	occupants_ids: [],
	updated_date: Date.now(),
	last_message_date_sent: Math.floor(Date.now() / 1000),
	last_message: '',
	last_message_id: '',
	last_message_user_id: 0,
	unread_messages_count: 0,
	unread_messages_ids: [],
	pinned_messages_ids: []
}

export default class Dialog {
	constructor(dialog = defaultDialog) {
		this.id = dialog._id || dialog.id
		this.type = dialog.type
		this.xmpp_type = dialog.type === 3 ? 'chat' : dialog.type ? 'groupchat' : ''
		this.room_jid = dialog.xmpp_room_jid || dialog.room_jid
		this.name = dialog.name
		this.photo = dialog.photo && { uri: dialog.photo }
		this.description = dialog.description
		this.destination = dialog.xmpp_room_jid || dialog.room_jid
		this.user_id = dialog.user_id
		this.admins_ids = dialog.admins_ids
		this.occupants_ids = dialog.occupants_ids
		this.updated_date = Date.parse(dialog.updated_at) || Date.now()
		this.last_message_date_sent = dialog.last_message_date_sent || Date.parse(dialog.updated_at)/1000 || Date.parse(dialog.created_at)/1000
		this.last_message = dialog.last_message || '<empty_history>'
		this.last_message_id = dialog.last_message_id
		this.last_message_user_id = dialog.last_message_user_id
		this.unread_messages_count = dialog.unread_messages_count
		this.unread_messages_ids = dialog.unread_messages_ids
		this.pinned_messages_ids = dialog.pinned_messages_ids
	}
}
