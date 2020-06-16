import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ImgPicker from '../../components/imgPicker';
import CreateBtn from '../../components/createBtn';
import { BTN_TYPE, SIZE_SCREEN } from '../../../helpers/constants';
import UsersContext from '../../../services/users-service';
import ChatContext from '../../../services/chat-service';
import Avatar from '../../components/avatar';
import Indicator from '../../components/indicator';
import { showAlert } from '../../../helpers/alert';
import { popToTop } from '../../../routing/init';

const GroupDetails = ({ navigation }) => {
  const dialog = navigation.getParam('dialog', false);
  const isNeedFetchUsers = navigation.getParam('isNeedFetchUsers', false);

  const UsersService = useContext(UsersContext);
  const ChatService = useContext(ChatContext);

  const [isPickImage, setIsPickImage] = useState(null);
  const [dialogName, setDialogName] = useState(dialog.name);
  const [dialogPhoto] = useState(dialog.photo);
  const [isLoader, setIsLoader] = useState(false);
  const [occupantsInfo, setOccupantsInfo] = useState(
    isNeedFetchUsers
      ? []
      : UsersService.getUsersInfoFromRedux(dialog.occupants_ids),
  );

  const input = useRef(null);

  useEffect(() => {
    const isNeedFetchUsers = navigation.getParam('isNeedFetchUsers', false);
    if (isNeedFetchUsers) {
      fetchMoreUsers(dialog.occupants_ids);
    }
  }, []);

  const fetchMoreUsers = async (occupants_ids) => {
    await UsersService.getOccupants(occupants_ids);
    const users = UsersService.getUsersInfoFromRedux(occupants_ids);
    setOccupantsInfo(users);
  };

  const pickPhoto = (image) => {
    setIsPickImage(image);
  };

  const updateDialog = async () => {
    const updateInfo = {};
    if (dialogName !== dialog.name) {
      updateInfo.name = dialogName;
    }
    if (isPickImage) {
      updateInfo.img = isPickImage;
    }
    if (Object.keys(updateInfo).length === 0) {
      return false;
    }
    updateInfo.dialogId = dialog.id;
    setIsLoader(true);
    try {
      await ChatService.updateDialogInfo(updateInfo);
      setIsLoader(false);
      showAlert('Dialog info is updated successfully');
    } catch (error) {
      setIsLoader(false);
      showAlert(error);
    }
  };

  const leaveGroup = () =>
    Alert.alert(
      'Are you sure you want to leave the group chat?',
      '',
      [
        {
          text: 'Yes',
          onPress: async () => {
            setIsLoader(true);
            try {
              await ChatService.deleteDialog(dialog.id);
              setIsLoader(false);
              navigation.dispatch(popToTop);
            } catch (error) {
              setIsLoader(false);
              navigation.dispatch(popToTop);
            }
          },
        },
        {
          text: 'Cancel',
        },
      ],
      { cancelable: false },
    );

  const isGroupCreator = () => ChatService.isGroupCreator(dialog.user_id);

  const goToContactDeteailsScreen = (dialog) => {
    navigation.push('ContactDetails', { dialog });
  };

  const goToContactsScreen = () => {
    if (occupantsInfo.length === 8) {
      showAlert('Maximum 9 participants');
      return;
    }
    navigation.push('Contacts', { isGroupDetails: true, dialog, addParticipant });
  };

  const addParticipant = async (participants) => {
    setIsLoader(true);
    try {
      const curDialog = await ChatService.addOccupantsToDialog(dialog.id, participants);
      const updateArrUsers = UsersService.getUsersInfoFromRedux(curDialog.occupants_ids);
      showAlert('Participants added');
      setIsLoader(false);
      setOccupantsInfo(updateArrUsers);
    } catch (error) {
      console.warn('addParticipant', error);
      setIsLoader(false);
    }
  };

  const updateName = curDialogName => setDialogName(curDialogName);

  const keyExtractor = (item, index) => index.toString();

  const _renderUser = ({ item }) => (
    <TouchableOpacity style={styles.renderContainer} onPress={() => goToContactDeteailsScreen(item)}>
      <View style={styles.renderAvatar}>
        <Avatar
          photo={item.avatar}
          name={item.full_name}
          iconSize="medium"
        />
        <Text style={styles.nameTitle}>{item.full_name}</Text>
      </View>
      <View>
        <Icon name="keyboard-arrow-right" size={30} color="#48A6E3" />
      </View>
    </TouchableOpacity>
  );

  const _renderFlatListHeader = () => (
    isGroupCreator()
      ? (
        <TouchableOpacity style={styles.renderHeaderContainer} onPress={goToContactsScreen}>
          <View style={styles.renderAvatar}>
            <Icon name="person-add" size={35} color="#48A6E3" style={{ marginRight: 15 }} />
          </View>
          <View>
            <Text style={styles.nameTitle}>Add member</Text>
          </View>
        </TouchableOpacity>
      )
      : false);

  const _renderFlatListFooter = () => (
    <TouchableOpacity style={styles.renderHeaderContainer} onPress={leaveGroup}>
      <View style={styles.renderAvatar}>
        <Icon name="exit-to-app" size={35} color="#48A6E3" style={{ marginRight: 15 }} />
      </View>
      <View>
        <Text style={styles.nameTitle}>Exit group</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={styles.container}>
      {isLoader
        && <Indicator color="blue" size={40} />}
      <ImgPicker
        name={dialogName}
        photo={dialogPhoto}
        pickPhoto={pickPhoto}
        isDisabled={!isGroupCreator()}
      />
      {isGroupCreator()
        ? (
          <View>
            <TextInput
              ref={input}
              style={styles.input}
              autoCapitalize="none"
              placeholder="Change group name ..."
              placeholderTextColor="grey"
              onChangeText={updateName}
              value={dialogName}
              maxLength={100}
            />
            <View style={styles.subtitleWrap}>
              <Text style={styles.subtitleInpu}>Change group name</Text>
            </View>
          </View>
        )
        : <Text style={styles.dialogName}>{dialogName}</Text>}
      <SafeAreaView style={styles.listUsers}>
        <FlatList
          data={occupantsInfo}
          ListHeaderComponent={_renderFlatListHeader}
          ListFooterComponent={_renderFlatListFooter}
          renderItem={_renderUser}
          keyExtractor={keyExtractor}
        />
      </SafeAreaView>
      {isGroupCreator()
        && <CreateBtn goToScreen={updateDialog} type={BTN_TYPE.CREATE_GROUP} />}
    </KeyboardAvoidingView>
  );
};

export default GroupDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  picker: {
    width: 102,
    height: 102,
    borderWidth: 1,
    borderColor: 'red',
  },
  imgPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  icon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 5,
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#48A6E3',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    color: 'black',
    width: 200,
    marginVertical: 15,
    padding: 7,
    paddingTop: 15,
    fontSize: 17,
  },
  subtitleInpu: {
    color: 'grey',
  },
  subtitleWrap: {
    position: 'absolute',
    marginVertical: -7,
    bottom: 0,
  },
  listUsers: {
    marginVertical: 35,
    flex: 1,
  },
  renderContainer: {
    width: SIZE_SCREEN.width - 30,
    borderBottomWidth: 0.5,
    borderColor: 'grey',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  renderHeaderContainer: {
    width: SIZE_SCREEN.width - 30,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: 'grey',
    alignItems: 'center',
    paddingVertical: 7,
  },
  renderAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameTitle: {
    fontSize: 17,
  },
  dialogName: {
    fontSize: 17,
    marginTop: 35,
  },
});
