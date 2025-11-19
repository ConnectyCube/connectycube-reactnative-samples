import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Avatar from '../../components/avatar';
import { ChatService, UsersService } from '../../../services';
import Indicator from '../../components/indicator';
import { DIALOG_TYPE } from '../../../helpers/constants';

export default function ContactDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const { dialog } = route.params;

  const [isLoader, setIsLoader] = useState(false);

  const gotToChat = () => {
    if (dialog.name) {
      navigation.goBack();
    } else {
      setIsLoader(true);

      ChatService.createPrivateDialog(dialog.id)
        .then((newDialog) => {
          setIsLoader(false);
          navigation.reset({
            index: 1,
            routes: [
              { name: 'Dialogs' },
              { name: 'Chat', params: { dialog: newDialog } },
            ],
          });
        });
    }
  };

  const dialogPhoto = dialog?.type === DIALOG_TYPE.PRIVATE ? UsersService.getUsersAvatar(dialog.occupants_ids) : dialog.avatar;

  return (
    <View style={styles.container}>
      <Indicator isActive={isLoader} />
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
          <Text style={styles.buttonLabel}>Start a chat</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

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
    color: 'grey',
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
