import { getImageLinkFromUID } from '../helpers/file';

export default class User {
  constructor(user) {
    this.id = user.id;
    this.avatar = User.getAvatarUrl(user.avatar);
    this.login = user.login;
    this.custom_data = user.custom_data ? user.custom_data : '';
    this.full_name = user.full_name;
    this.phone = user.phone;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
    this.last_request_at = user.last_request_at;
  }
  static getAvatarUrl(avatarUID) {
    return getImageLinkFromUID(avatarUID);
  }
}
