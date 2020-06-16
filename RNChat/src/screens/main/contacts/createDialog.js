import React, { useState, useContext } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';

import Avatar from '../../components/avatar';
import { SIZE_SCREEN, BTN_TYPE } from '../../../helpers/constants';
import ChatContext from '../../../services/chat-service';
import CreateBtn from '../../components/createBtn';
import Indicator from '../../components/indicator';
import { showAlert } from '../../../helpers/alert';
import { popToTop } from '../../../routing/init';
import UsersContext from '../../../services/users-service';

const CreateDialog = ({ navigation }) => {
  const ChatService = useContext(ChatContext);
  const UsersService = useContext(UsersContext);
  const [keyword, setKeyword] = useState('');
  const [isPickImage, setIsPickImage] = useState(null);
  const [isLoader, setIsLoader] = useState(false);
  const [search, setSearch] = useState(null);
  const users = navigation.getParam('users');

  const renderParticipant = (item) => (
    <View style={styles.participant} key={item.id}>
      <View style={{ paddingLeft: 10 }}>
        <Avatar
          photo={item.avatar}
          name={item.full_name}
          iconSize="medium"
        />
      </View>
      <Text numberOfLines={2} style={{ textAlign: 'center' }}>{item.full_name}</Text>
    </View>
  );

  const createDialog = async () => {
    const str = keyword.trim();
    if (str.length < 3) {
      return showAlert('Enter more than 4 characters');
    }
    setIsLoader(true);
    const occupants_ids = users.map(elem => elem.id);
    const newDialog = await ChatService.createPublicDialog(occupants_ids, str, isPickImage);
    setIsLoader(false);
    navigation.dispatch(popToTop);
    navigation.push('Chat', { dialog: newDialog, isNeedFetchUsers: true, getUsersAvatar: UsersService.getUsersAvatar });
  };

  const onPickImage = async () => {
    const image = await ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    });
    setIsPickImage(image);
  };

  const updateSearch = keyword => setKeyword(keyword);

  return (
    <View style={styles.container}>
      {isLoader
        && <Indicator color="blue" size={40} />}
      <View style={styles.header}>
        <TouchableOpacity onPress={onPickImage} style={styles.picker}>
          {isPickImage
            ? (
              <Image
                style={styles.imgPicker}
                source={{ uri: isPickImage.path }}
              />
            )
            : (
              <View style={styles.iconPicker}>
                <Icon name="local-see" size={50} color="#48A6E3" />
              </View>
            )}
        </TouchableOpacity>
        <View style={styles.description}>
          <TextInput
            style={styles.searchInput}
            autoCapitalize="none"
            placeholder="Group name..."
            returnKeyType="search"
            onChangeText={updateSearch}
            placeholderTextColor="grey"
            value={search}
            maxLength={255}
          />
          <Text style={styles.descriptionText}>Please provide a group subject and optional group icon</Text>
        </View>
      </View>
      <View style={styles.participantsContainer}>
        {users.map(renderParticipant)}
      </View>
      <CreateBtn goToScreen={createDialog} type={BTN_TYPE.CREATE_GROUP} />
    </View>
  );
};

export default CreateDialog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginVertical: 20,
    marginHorizontal: 10,
    flexDirection: 'row',
  },
  participantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  participant: {
    width: 72,
    padding: 5,
    height: 100,
  },
  searchInput: {
    fontSize: 18,
    color: 'black',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: 'grey',
  },
  picker: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  iconPicker: {
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#48A6E3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgPicker: {
    width: 70,
    height: 70,
    borderRadius: 40,
  },
  description: {
    width: SIZE_SCREEN.width - 110,
  },
  descriptionText: {
    paddingVertical: 5,
    color: 'grey',
    fontSize: 15,
  },
});
