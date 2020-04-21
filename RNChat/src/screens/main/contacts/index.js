import React, { useState, useContext } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconGroup from 'react-native-vector-icons/FontAwesome';

import UsersContext from '../../../services/users-service';
import Indicator from '../../components/indicator';
import User from './renderUser';
import Avatar from '../../components/avatar';
import { showAlert } from '../../../helpers/alert';
import CreateBtn from '../../components/createBtn';
import { BTN_TYPE } from '../../../helpers/constants';
import ChatContext from '../../../services/chat-service';
import { popToTop } from '../../../routing/init';

const Contacts = ({ navigation }) => {
  const UsersService = useContext(UsersContext);
  const ChatService = useContext(ChatContext);
  const isGroupDetails = navigation.getParam('isGroupDetails', false);
  const dialog = navigation.getParam('dialog', false);

  const [keyword, setKeyword] = useState('');
  const [isLoader, setIsLoader] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [dialogType, setDialogType] = useState(isGroupDetails);
  const [listUsers, setListUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userNotFound, setUserNotFound] = useState(false);

  const updateSearch = curKeyword => setKeyword(curKeyword);

  const keyExtractor = (item, index) => index.toString();

  const toggleUserSelect = (user) => {
    const newArr = [];
    selectedUsers.forEach(elem => {
      if (elem.id !== user.id) {
        newArr.push(elem);
      }
    });
    setSelectedUsers(newArr);
    setIsUpdate(!isUpdate);
  };

  const _renderUser = ({ item }) => {
    const isSelected = selectedUsers.find(elem => elem.id === item.id);
    return (
      <User
        user={item}
        selectUsers={selectUsers}
        dialogType={dialogType}
        selectedUsers={!!isSelected}
      />
    );
  };

  const changeTypeDialog = () => {
    setSelectedUsers([]);
    setDialogType(!dialogType);
  };

  const _renderSelectedUser = ({ item }) => (
    <TouchableOpacity style={styles.selectedUser} onPress={() => toggleUserSelect(item)}>
      <View style={{ paddingLeft: 10 }}>
        <Avatar
          photo={item.avatar}
          name={item.full_name}
          iconSize="medium"
        />
        <View
          style={{
            position: 'absolute',
            bottom: 7,
            right: 7,
            backgroundColor: 'white',
            width: 20,
            height: 20,
            borderRadius: 10,
          }}
        >
          <Icon name="cancel" size={20} color="grey" />
        </View>
      </View>
      <Text numberOfLines={2} style={{ textAlign: 'center' }}>{item.full_name}</Text>
    </TouchableOpacity>
  );

  const selectUsers = async (user) => {
    const str = dialog
      ? dialog.occupants_ids.length
      : 1;
    // False - Private dialog
    if (!dialogType) {
      const newDialog = await ChatService.createPrivateDialog(user.id);
      navigation.dispatch(popToTop);
      navigation.push('Chat', { dialog: newDialog, getUsersAvatar: UsersService.getUsersAvatar });
    }

    // True - Publick dialog
    const userSelect = selectedUsers.find(elem => elem.id === user.id);
    if (userSelect) {
      const newArr = [];
      selectedUsers.forEach(elem => {
        if (elem.id !== user.id) {
          newArr.push(elem);
        }
      });
      setSelectedUsers(newArr);
    } else {
      if (selectedUsers.length + str === 9) {
        showAlert('Maximum 9 participants');
        return;
      }
      selectedUsers.push(user);
    }
    setIsUpdate(!isUpdate);
  };

  const searchUsers = async () => {
    const str = keyword.trim();
    if (str.length > 2) {
      setIsLoader(true);
      try {
        const users = await UsersService.listUsersByFullName(str, dialog?.occupants_ids);
        setListUsers(users);
        setUserNotFound(false);
        setIsLoader(false);
      } catch (error) {
        setUserNotFound(true);
        setIsLoader(false);
      }
    } else {
      showAlert('Enter more than 3 characters');
    }
  };

  const goToCreateDialogScreen = () => {
    if (isGroupDetails) {
      const addParticipant = navigation.getParam('addParticipant', false);
      navigation.goBack();
      addParticipant(selectedUsers);
      return;
    }
    navigation.push('CreateDialog', { users: selectedUsers });
  };

  return (
    <View style={styles.container}>
      {isLoader && (
        <Indicator color="red" size={40} />
      )}
      <View style={styles.searchUser}>
        <TextInput
          style={styles.searchInput}
          autoCapitalize="none"
          placeholder="Search users..."
          placeholderTextColor="grey"
          returnKeyType="search"
          onChangeText={updateSearch}
          onSubmitEditing={searchUsers}
          value={keyword}
        />
      </View>
      <View style={styles.dialogTypeContainer}>
        {!isGroupDetails
          && (
            <TouchableOpacity style={styles.dialogType} onPress={changeTypeDialog}>
              {dialogType ? <IconGroup name="group" size={25} color="#48A6E3" />
                : <IconGroup name="user" size={25} color="#48A6E3" />}
              <Text style={styles.dialogTypeText}>{dialogType ? 'Create private chat' : 'Create group chat'}</Text>
            </TouchableOpacity>
          )}
      </View>
      <View style={selectedUsers.length > 0 && styles.containerCeletedUsers}>
        <FlatList
          data={selectedUsers}
          keyExtractor={keyExtractor}
          renderItem={(item) => _renderSelectedUser(item)}
          horizontal
        />
      </View>
      {userNotFound
        ? (<Text style={styles.userNotFound}>{'Couldn\'t find user'}</Text>)
        : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={listUsers}
              keyExtractor={keyExtractor}
              renderItem={(item) => _renderUser(item)}
            />
          </View>
        )}
      {selectedUsers.length > 0 && (
        <CreateBtn goToScreen={goToCreateDialogScreen} type={BTN_TYPE.CONTACTS} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchUser: {
    margin: 10,
  },
  searchInput: {
    fontSize: 18,
    fontWeight: '300',
    borderWidth: 0.5,
    borderRadius: 20,
    borderColor: 'grey',
    color: 'black',
    padding: 10,
  },
  dialogTypeContainer: {
    marginHorizontal: 12,
    paddingVertical: 10,
  },
  dialogType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dialogTypeText: {
    marginHorizontal: 5,
    fontSize: 16,
  },
  containerCeletedUsers: {
    borderBottomWidth: 0.5,
    borderColor: 'grey',
    margin: 10,
  },
  selectedUser: {
    width: 70,
    paddingBottom: 5,
    alignItems: 'center',
  },
  userNotFound: {
    fontSize: 17,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default Contacts;
