import React, { useState } from 'react';
import { StyleSheet, View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import IconGroup from 'react-native-vector-icons/FontAwesome';
import { ChatService, UsersService } from '../../../services';
import Indicator from '../../components/indicator';
import Participant from './participant';
import Avatar from '../../components/avatar';
import { showAlert } from '../../../helpers/alert';
import CreateBtn from '../../components/createBtn';
import { BTN_TYPE } from '../../../helpers/constants';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import useKeyboardOffset from '../../../hooks/useKeyboardOffset';

export default function Contacts() {
  const route = useRoute();
  const navigation = useNavigation();
  const keyboardOffset = useKeyboardOffset();
  const dialog = route.params?.dialog;
  const isGroupDetails = !!dialog;

  const [keyword, setKeyword] = useState('');
  const [isLoader, setIsLoader] = useState(false);
  const [isGroupDialog, setIsGroupDialog] = useState(isGroupDetails);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchedUsers, setSearchedUsers] = useState([]);

  const keyExtractor = (item, index) => index.toString();

  const toggleUserSelect = (user) => {
    const newArr = [];
    selectedUsers.forEach(elem => {
      if (elem.id !== user?.id) {
        newArr.push(elem);
      }
    });
    setSelectedUsers(newArr);
  };

  const toggleUserUnselect = (user) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const _renderUser = ({ item }) => {
    const isSelected = selectedUsers.find(elem => elem.id === item.id);
    return (
      <Participant
        user={item}
        onSelectUser={onSelectUser}
        isGroupDialog={isGroupDialog}
        isSelected={!!isSelected}
      />
    );
  };

  const changeTypeDialog = () => {
    setSelectedUsers([]);
    setIsGroupDialog(!isGroupDialog);
  };

  const _renderSelectedUser = ({ item }) => {
    return (
      <TouchableOpacity style={styles.selectedUser} onPress={() => toggleUserSelect(item)}>
        <View style={{ paddingLeft: 10 }}>
          <Avatar
            photo={item.avatar}
            name={item.full_name}
            iconSize="medium"
          />
          <View style={{ position: 'absolute', bottom: 7, right: 7, backgroundColor: 'white', width: 20, height: 20, borderRadius: 10 }}>
            <Icon name="cancel" size={20} color="grey" />
          </View>
        </View>
        <Text numberOfLines={2} style={{ textAlign: 'center', color: 'grey' }}>{item.full_name}</Text>
      </TouchableOpacity >
    );
  };

  const onSelectUser = (user) => {
    // 1-1 chat
    if (!isGroupDialog) {
      return ChatService.createPrivateDialog(user?.id)
        .then((newDialog) => {
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Dialogs' },
              { name: 'Chat', params: { dialog: newDialog } },
            ],
          });
        });
    }

    // group chat
    const isUserSelected = selectedUsers.find(elem => elem.id === user?.id);
    if (isUserSelected) {
      toggleUserSelect(user);
    } else {
      const occupantsCount = dialog ? dialog.occupants_ids.length : 1;
      if (selectedUsers.length + occupantsCount === 9) {
        showAlert('Maximum 9 participants');
        return;
      }

      toggleUserUnselect(user);
    }
  };

  const searchUsers = () => {
    let keywordTrimmed = keyword.trim();

    if (keywordTrimmed.length > 2) {
      setIsLoader(true);

      UsersService.listUsersByFullName(keywordTrimmed, dialog?.occupants_ids)
        .then(users => {
          setSearchedUsers(users);
          setIsLoader(false);
        })
        .catch(() => {
          setIsLoader(false);
        });
    } else {
      showAlert('Enter more than 3 characters');
    }
  };

  const goToCreateDialogScreen = () => {
    if (isGroupDetails) {
      const addParticipantAction = route.params?.addParticipant || false;
      navigation.goBack();
      addParticipantAction(selectedUsers);
      return;
    }
    navigation.push('CreateDialog', { users: selectedUsers });
  };

  return (
    <View style={styles.container}>
      <Indicator isActive={isLoader} />
      <View style={styles.dialogTypeContainer}>
        {!isGroupDetails &&
          <TouchableOpacity style={styles.dialogType} onPress={changeTypeDialog}>
            {!isGroupDialog ? <IconGroup name="group" size={25} color="#48A6E3" /> :
              <IconGroup name="user" size={25} color="#48A6E3" />
            }
            <Text style={styles.dialogTypeText}>{isGroupDialog ? 'Switch to private chat creation' : 'Switch to group chat creation'}</Text>
          </TouchableOpacity>
        }
      </View>
      <View style={styles.searchUser}>
        <TextInput style={styles.searchInput}
          autoCapitalize="none"
          placeholder="Search users..."
          placeholderTextColor="grey"
          returnKeyType="search"
          onChangeText={setKeyword}
          onSubmitEditing={searchUsers}
          value={keyword}
        />
      </View>
      <View style={selectedUsers.length > 0 && styles.containerSelectedUsers}>
        <FlatList
          data={selectedUsers}
          keyExtractor={keyExtractor}
          renderItem={(item) => _renderSelectedUser(item)}
          horizontal={true}
        />
      </View>
      <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={keyboardOffset}>
        <FlatList
          data={searchedUsers}
          keyExtractor={keyExtractor}
          renderItem={(item) => _renderUser(item)}
        />
      </KeyboardAvoidingView>
      {selectedUsers.length > 0 && (
        <CreateBtn goToScreen={goToCreateDialogScreen} type={BTN_TYPE.CONTACTS} />
      )}
    </View>
  );
}

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
    color: 'grey',
  },
  containerSelectedUsers: {
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
