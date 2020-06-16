import React, { useContext } from 'react';
import ConnectyCube from 'react-native-connectycube';

import UserModel from '../models/user';
import { fetchUsers } from '../actions/users';
import GlobalContext from '../store';

const UsersContext = React.createContext();

export default UsersContext;

const UsersProvider = ({ children }) => {
  const { store, dispatch } = useContext(GlobalContext);

  const getUserById = async (id) => {
    ConnectyCube.users.get(id);
  };

  const getOccupants = async (ids) => {
    const users = getUsers;
    const idsForFetch = [];

    ids.forEach(elem => {
      if (elem !== currentUser.id && !users[elem]) {
        idsForFetch.push(elem);
      }
    });

    if (idsForFetch.length === 0) { return; }

    const usersFromServer = await ConnectyCube.users.get({
      per_page: 100,
      filter: {
        field: 'id',
        param: 'in',
        value: idsForFetch,
      },
    });
    const newUsers = usersFromServer.items.map(elem => new UserModel(elem.user));
    dispatch(fetchUsers(newUsers));
  };

  const getUsersAvatar = (ids) => {
    const currentUserId = currentUser;
    let userId = null;
    ids.forEach(elem => {
      if (elem != currentUserId.id) {
        userId = elem;
      }
    });
    return store.users[userId].avatar;
  };

  const listUsersByFullName = async (name, usersIdsToIgnore = []) => {
    if (!usersIdsToIgnore) {
      usersIdsToIgnore = [currentUser.id];
    }
    const allUsers = await ConnectyCube.users.get({ per_page: 100, full_name: name });
    const contacts = [];
    allUsers.items.forEach(elem => {
      if (!usersIdsToIgnore.includes(elem.user.id)) {
        contacts.push(new UserModel(elem.user));
      }
    });
    return contacts;
  };

  const getUsersInfoFromRedux = (ids) => {
    const usersInfo = [];
    ids.forEach(elem => {
      if (elem !== currentUser.id) {
        usersInfo.push(store.users[elem]);
      }
    });
    return usersInfo;
  };

  const currentUser = store.currentUser?.user;

  const getUsers = store.users;

  return (
    <UsersContext.Provider
      value={{
        getUserById,
        getOccupants,
        getUsersAvatar,
        listUsersByFullName,
        getUsersInfoFromRedux,
        getUsers: store.users,
        users: store.users,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export { UsersProvider };
