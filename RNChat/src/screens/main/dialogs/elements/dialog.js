import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Avatar from '../../../components/avatar';
import DialogTitle from './dialogTitle';
import DialogLastDate from './dialogLastDate';
import DialogUnreadCounter from './dialogUnreadCounter';
import { UsersService } from '../../../../services';
import { DIALOG_TYPE } from '../../../../helpers/constants';

export default function Dialog({ dialog, onDialogClick }) {

  const onPress = async () => {
    onDialogClick(dialog);
  };

  const dialogPhoto = dialog.type === DIALOG_TYPE.PRIVATE
    ? UsersService.getUsersAvatar(dialog.occupants_ids)
    : dialog.photo;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Avatar
          photo={dialogPhoto}
          name={dialog.name}
          iconSize="large"
        />
        <View style={styles.border} >
          <DialogTitle
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
    </TouchableOpacity >
  );
}

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
