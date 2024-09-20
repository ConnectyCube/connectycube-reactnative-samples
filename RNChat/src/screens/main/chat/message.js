import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Avatar from '../../components/avatar';
import { getTime } from '../../../helpers/getTime';
import MessageStatus from '../../components/messageStatus';
import ChatImage from '../../components/chatImage';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SIZE_SCREEN } from '../../../helpers/constants';

export default function Message({ message, messageSendState, messageAttachments, otherSender }) {
  const navigation = useNavigation();
  const users = useSelector((state) => state.users);
  const user = users[message.sender_id] ?? { avatar: '', full_name: 'Unknown' };

  const renderAttachment = () => {
    return (
      <TouchableOpacity style={{ marginBottom: 3 }} onPress={handleModalState}>
        <ChatImage photo={messageAttachments[0].url} width={200} height={150} />
      </TouchableOpacity>
    );
  };

  const handleModalState = () => {
    navigation.push('ImageViewer', { attachment: messageAttachments[0] });
  };

  return otherSender ?
    (
      <View style={[styles.container, styles.positionToLeft]} >
        <Avatar
          photo={user.avatar}
          name={user.full_name}
          iconSize="small"
        />
        <View style={[styles.message, styles.messageToLeft]}>
          {messageAttachments && renderAttachment()}
          <Text style={[styles.messageText, (otherSender ? styles.selfToLeft : styles.selfToRight)]}>
            {message.body || ' '}
          </Text>
          <Text style={styles.dateSent}>
            {getTime(message.date_sent)}
          </Text>
        </View>
      </View>
    ) : (
      <View style={[styles.container, styles.positionToRight]}>
        <View style={[styles.message, styles.messageToRight]}>
          {messageAttachments && renderAttachment()}
          <Text style={[styles.messageText, styles.selfToRight]}>
            {message.body || ' '}
          </Text>
          <View style={styles.dateSentContainer}>
            <Text style={styles.dateSent}>
              {getTime(message.date_sent)}
            </Text>
            <MessageStatus send_state={messageSendState} />
          </View>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  positionToLeft: {
    justifyContent: 'flex-start',
  },
  positionToRight: {
    justifyContent: 'flex-end',
  },
  message: {
    paddingTop: 5,
    paddingBottom: 3,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  messageToLeft: {
    maxWidth: SIZE_SCREEN.width - 90,
    borderBottomLeftRadius: 2,
    backgroundColor: '#63D9C6',
  },
  messageToRight: {
    maxWidth: SIZE_SCREEN.width - 55,
    borderBottomRightRadius: 2,
    backgroundColor: '#48A6E3',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  selfToLeft: {
    alignSelf: 'flex-start',
  },
  selfToRight: {
    alignSelf: 'flex-end',
  },
  dateSent: {
    alignSelf: 'flex-end',
    paddingTop: 1,
    paddingHorizontal: 3,
    fontSize: 12,
    color: 'lightcyan',
  },
  dateSentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
