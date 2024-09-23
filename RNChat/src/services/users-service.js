import ConnectyCube from 'react-native-connectycube';
import UserModel from '../models/user';
import store from '../redux/store';
import { fetchUsers } from '../redux/slices/users';

class UsersService {
  constructor() {
    if (UsersService.instance) {
      return UsersService.instance;
    }

    UsersService.instance = this;
  }

  async getOccupants(ids) {
    const users = this.getUsers;
    let idsForFetch = [];

    ids.forEach(elem => {
      if (elem !== this.currentUser?.id && !users[elem]) {
        idsForFetch.push(elem);
      }
    });

    if (idsForFetch.length === 0) { return; }

    const usersFromServer = await ConnectyCube.users.getV2({
      // per_page: 100,
      // filter: [{ field: 'id', param: 'in', value: idsForFetch }]
      id: { in: idsForFetch },
    });
    const newUsers = usersFromServer.items.map(elem => {
      return new UserModel(elem.user);
    });
    store.dispatch(fetchUsers(newUsers));
  }

  getUsersAvatar(ids) {
    let userId = null;
    ids.forEach(elem => {
      if (elem != this.currentUser?.id) {
        userId = elem;
      }
    });
    return store.getState().users[userId].avatar;
  }

  async listUsersByFullName(name, usersIdsToIgnore = []) {
    if (!usersIdsToIgnore) {
      usersIdsToIgnore = [this.currentUser?.id];
    }
    const allUsers = await ConnectyCube.users.get({ per_page: 100, full_name: name });
    let contacts = [];
    allUsers.items.forEach(elem => {
      if (!usersIdsToIgnore.includes(elem.user.id)) {
        contacts.push(new UserModel(elem.user));
      }
    });
    return contacts;
  }

  getUsersInfoFromRedux(ids) {
    const users = this.getUsers;
    const usersInfo = [];
    ids.forEach(id => {
      if (id !== this.currentUser?.id) {
        users[id] && usersInfo.push(users[id]);
      }
    });
    return usersInfo;
  }

  get currentUser() {
    return store.getState().currentUser?.user;
  }

  get getUsers() {
    return store.getState().users;
  }

}

export default new UsersService();

