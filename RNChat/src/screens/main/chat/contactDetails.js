import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import Avatar from '../../components/avatar';
import ChatContext from '../../../services/chat-service';
import UsersContext from '../../../services/users-service';
import Indicator from '../../components/indicator';
import { popToTop } from '../../../routing/init';

const ContactDetails = ({ navigation }) => {
  const ChatService = useContext(ChatContext);
  const UsersService = useContext(UsersContext);
  const [isLoader, setIsLoader] = useState(false);

  const gotToChat = async () => {
    const user = navigation.getParam('dialog', false);
    if (user.name) {
      navigation.goBack();
    } else {
      setIsLoader(true);
      const newDialog = await ChatService.createPrivateDialog(user.id);
      setIsLoader(false);
      navigation.dispatch(popToTop);
      navigation.push('Chat', { dialog: newDialog, getUsersAvatar: UsersService.getUsersAvatar });
    }
  };

  const dialog = navigation.getParam('dialog', false);
  let dialogPhoto;

  if (dialog?.type) {
    // if group chat
    dialogPhoto = UsersService.getUsersAvatar(dialog.occupants_ids);
  } else {
    // if private chat
    dialogPhoto = dialog.avatar;
  }

  return (
    <View style={styles.container}>
      {isLoader && (
        <Indicator color="red" size={40} />
      )}
      <Avatar
        photo={dialogPhoto}
        name={dialog.name || dialog.full_name}
        iconSize="extra-large"
      />
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{dialog.name || dialog.full_name}</Text>
      </View>
      <TouchableOpacity onPress={gotToChat}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonLabel}>Start a dialog</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ContactDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: {
    marginVertical: 70,
    borderBottomWidth: 1,
    borderColor: 'grey',
    width: '40%',
  },
  name: {
    fontSize: 18,
    textAlign: 'center',
    padding: 5,
  },
  buttonContainer: {
    height: 50,
    width: 200,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#00e3cf',
    backgroundColor: '#00e3cf',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
});
