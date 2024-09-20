import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImgPicker from '../../components/imgPicker';
import CreateBtn from '../../components/createBtn';
import { BTN_TYPE } from '../../../helpers/constants';
import { UsersService, ChatService } from '../../../services';
import Avatar from '../../components/avatar';
import { SIZE_SCREEN } from '../../../helpers/constants';
import Indicator from '../../components/indicator';
import { showAlert } from '../../../helpers/alert';

export default function GroupDetails() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dialog, isNeedFetchUsers } = route.params;
  const defaultOccupantsInfo = isNeedFetchUsers ? [] : UsersService.getUsersInfoFromRedux(dialog.occupants_ids);
  const [dialogName, setDialogName] = useState(dialog.name);
  const [isLoader, setIsLoader] = useState(false);
  const [pickedImage, setPickedImage] = useState(false);
  const [occupantsInfo, setOccupantsInfo] = useState(defaultOccupantsInfo);

  useEffect(() => {
    if (isNeedFetchUsers) {
      fetchMoreUsers(dialog.occupants_ids);
    }
  }, []);

  const fetchMoreUsers = async (occupants_ids) => {
    await UsersService.getOccupants(occupants_ids);
    const users = UsersService.getUsersInfoFromRedux(occupants_ids);
    setOccupantsInfo(users);
  };

  const onPickPhoto = (image) => {
    setPickedImage(image);
  };

  const updateDialog = () => {
    const updateInfo = {};
    if (dialogName !== dialog.name) {
      updateInfo.name = dialogName;
    }
    if (pickedImage) {
      updateInfo.photo = pickedImage;
    }
    if (Object.keys(updateInfo).length === 0) {
      return false;
    }
    updateInfo.dialogId = dialog.id;

    setIsLoader(true);

    ChatService.updateDialog(updateInfo)
      .then(() => {
        setIsLoader(false);

        showAlert('Dialog info is updated successfully');
      })
      .catch((error) => {
        setIsLoader(false);

        showAlert(error);
      });
  };

  const leaveGroup = () => {
    Alert.alert(
      'Are you sure you want to leave the group chat?',
      '',
      [
        {
          text: 'Yes',
          onPress: async () => {
            setIsLoader(true);
            await ChatService.deleteDialog(dialog.id);
            setIsLoader(false);
            navigation.reset({
              index: 0,
              routes: [{ name: 'Dialogs' }],
            });
          },
        },
        {
          text: 'Cancel',
        },
      ],
      { cancelable: false }
    );
  };

  const isGroupCreator = () => {
    return ChatService.isGroupCreator(dialog.user_id);
  };

  const goToContactDetailsScreen = (item) => {
    navigation.push('ContactDetails', { dialog: item });
  };

  const goToContactsScreen = () => {
    if (occupantsInfo.length >= 8) {
      showAlert('Maximum 9 participants');
      return;
    }

    navigation.push('Contacts', { dialog, addParticipant: addParticipantAction });
  };

  const addParticipantAction = (participants) => {
    setIsLoader(true);

    ChatService.addOccupantsToDialog(dialog.id, participants)
      .then(({ occupants_ids }) => {
        showAlert('Participants added');
        setIsLoader(false);

        const updateArrUsers = UsersService.getUsersInfoFromRedux(occupants_ids);

        setOccupantsInfo(updateArrUsers);
      })
      .catch(error => {
        setIsLoader(false);
      });
  };

  const keyExtractor = ({ id }) => id.toString();

  const _renderUser = ({ item }) => {
    return (
      <TouchableOpacity style={styles.renderContainer} onPress={() => goToContactDetailsScreen(item)}>
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
  };

  const _renderFlatListHeader = () => {
    return isGroupCreator() ?
      (
        <TouchableOpacity style={styles.renderHeaderContainer} onPress={goToContactsScreen}>
          <View style={styles.renderAvatar}>
            <Icon name="person-add" size={35} color="#48A6E3" style={{ marginRight: 15 }} />
          </View>
          <View>
            <Text style={styles.nameTitle}>Add member</Text>
          </View>
        </TouchableOpacity>
      ) : false;
  };

  const _renderFlatListFooter = () => {
    return <TouchableOpacity style={styles.renderHeaderContainer} onPress={leaveGroup}>
      <View style={styles.renderAvatar}>
        <Icon name="exit-to-app" size={35} color="#48A6E3" style={{ marginRight: 15 }} />
      </View>
      <View>
        <Text style={styles.nameTitle}>Exit group</Text>
      </View>
    </TouchableOpacity>;
  };

  return (
    <View style={styles.container}>
      <Indicator isActive={isLoader} />
      <ImgPicker name={dialogName} photo={dialog.photo} onPickPhoto={onPickPhoto} disabled={!isGroupCreator()} />
      {isGroupCreator() ?
        (<View>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            placeholder="Change group name ..."
            placeholderTextColor="grey"
            onChangeText={setDialogName}
            value={dialogName}
            maxLength={100}
          />
          <View style={styles.subtitleWrap}>
            <Text style={styles.subtitleInput}>Change group name</Text>
          </View>
        </View>) :
        <Text style={styles.dialogName}>{dialogName}</Text>
      }
      <SafeAreaView style={styles.listUsers}>
        <FlatList
          data={occupantsInfo}
          ListHeaderComponent={_renderFlatListHeader}
          ListFooterComponent={_renderFlatListFooter}
          renderItem={_renderUser}
          keyExtractor={keyExtractor}
        />
      </SafeAreaView>
      {isGroupCreator() &&
        <CreateBtn goToScreen={updateDialog} type={BTN_TYPE.CREATE_GROUP} />
      }
    </View>
  );
}

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
  subtitleInput: {
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
    color: 'grey',
  },
  dialogName: {
    fontSize: 17,
    marginTop: 35,
  },
});
