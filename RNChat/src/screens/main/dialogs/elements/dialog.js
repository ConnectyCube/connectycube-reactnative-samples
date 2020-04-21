import React, { useContext } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';

import Avatar from '../../../components/avatar';
import DialogTitles from './dialogTitles';
import DialogLastDate from './dialogLastDate';
import DialogUnreadCounter from './dialogUnreadCounter';
import UsersContext from '../../../../services/users-service';
import { DIALOG_TYPE } from '../../../../helpers/constants';

const Dialog = ({ dialog, navigation }) => {
  const UsersService = useContext(UsersContext);

  const getOccupants = async () => {
    await UsersService.getOccupants(dialog.occupants_ids);
    navigation.navigate('Chat', { dialog, getUsersAvatar: UsersService.getUsersAvatar });
  };

  const getUsersAvatar = (ids) => UsersService.getUsersAvatar(ids);

  let dialogPhoto = '';
  if (dialog.type === DIALOG_TYPE.PRIVATE) {
    dialogPhoto = getUsersAvatar(dialog.occupants_ids);
  } else {
    dialogPhoto = dialog.photo;
  }

  return (
    <TouchableOpacity onPress={getOccupants}>
      <View style={styles.container}>
        <Avatar
          photo={dialogPhoto}
          name={dialog.name}
          iconSize="large"
        />
        <View style={styles.border}>
          <DialogTitles
            name={dialog.name}
            message={dialog.last_message}
          />
          <View style={styles.infoContainer}>
            <DialogLastDate
              lastDate={dialog.last_message_date_sent}
              lastMessage={dialog.last_message}
              updatedDate={dialog.updated_date}
            />
            <DialogUnreadCounter
              unreadMessagesCount={dialog.unread_messages_count}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Dialog;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingHorizontal: 10,
  },
  border: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: 'lightgrey',
  },
  infoContainer: {
    maxWidth: 75,
    height: 50,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingVertical: 10,
    marginLeft: 5,
  },
});
