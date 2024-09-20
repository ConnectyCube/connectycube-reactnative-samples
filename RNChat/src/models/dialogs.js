import { getImageLinkFromUID } from '../helpers/file';

export default class Dialog {
  constructor(dialog) {
    this.id = dialog._id || dialog.id;
    this.type = dialog.type;
    this.xmpp_room_jid = dialog.xmpp_room_jid;
    this.xmpp_type = dialog.type === 3 ? 'chat' : dialog.type ? 'groupchat' : '';
    this.name = dialog.name;
    this.photo = Dialog.getAvatarUrl(dialog.photo);
    this.description = dialog.description;
    this.destination = dialog.xmpp_room_jid || dialog.room_jid; // ?????
    this.user_id = dialog.user_id;
    this.admins_ids = dialog.admins_ids;
    this.occupants_ids = dialog.occupants_ids;
    this.updated_date = Date.parse(dialog.updated_at) || Date.now();
    this.last_message_date_sent = dialog.last_message_date_sent || Date.parse(dialog.updated_at) / 1000 || Date.parse(dialog.created_at) / 1000;
    this.last_message = dialog.last_message || '';
    this.last_message_id = dialog.last_message_id;
    this.last_message_user_id = dialog.last_message_user_id;
    this.unread_messages_count = dialog.unread_messages_count;
    this.unread_messages_ids = dialog.unread_messages_ids;
    this.pinned_messages_ids = dialog.pinned_messages_ids;
  }

  static getAvatarUrl(avatarUID) {
    return getImageLinkFromUID(avatarUID);
  }
}
