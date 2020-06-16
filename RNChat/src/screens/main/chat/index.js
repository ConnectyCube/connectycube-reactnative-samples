import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AttachmentIcon from 'react-native-vector-icons/Entypo';
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput';
import ImagePicker from 'react-native-image-crop-picker';

import ChatContext from '../../../services/chat-service';
import Message from './message';
import Avatar from '../../components/avatar';
import { DIALOG_TYPE } from '../../../helpers/constants';
import AuthContext from '../../../services/auth-service';

const Chat = ({ navigation }) => {
  const { currentUser } = useContext(AuthContext);
  const ChatService = useContext(ChatContext);
  const history = ChatService.messages[navigation.state.params.dialog.id];

  const [activIndicator, setActivIndicator] = useState(true);
  const [messageText, setMessageText] = useState('');
  let needToGetMoreMessage = null;

  useEffect(() => {
    init();
    return () => {
      ChatService.resetSelectedDialogs();
    };
  }, []);

  const init = async () => {
    try {
      const { dialog } = navigation.state.params;
      setActivIndicator(true);
      const amountMessages = await ChatService.getMessages(dialog);
      if (amountMessages === 100) {
        needToGetMoreMessage = true;
      } else {
        needToGetMoreMessage = false;
      }
      setActivIndicator(false);
    } catch (e) {
      alert(`Error.\n\n${JSON.stringify(e)}`);
    }
  };

  const getMoreMessages = async () => {
    if (needToGetMoreMessage) {
      const { dialog } = navigation.state.params;
      setActivIndicator(true);
      const amountMessages = await ChatService.getMoreMessages(dialog);
      if (amountMessages === 100) {
        needToGetMoreMessage = true;
      } else {
        needToGetMoreMessage = false;
      }
      setActivIndicator(false);
    }
  };

  const onTypeMessage = messageText => setMessageText(messageText);

  const sendMessage = async () => {
    const { dialog } = navigation.state.params;
    if (messageText.length <= 0) return;
    await ChatService.sendMessage(dialog, messageText);
    setMessageText('');
  };

  const sendAttachment = async () => {
    const { dialog } = navigation.state.params;
    const img = await onPickImage();
    ChatService.sendMessage(dialog, '', img);
  };

  const onPickImage = async () =>
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    });

  const _keyExtractor = (item, index) => index.toString();

  const _renderMessageItem = (message) => {
    const { user } = currentUser;
    const isOtherSender = Number(message.sender_id) !== user.id;
    return (
      <Message otherSender={isOtherSender} message={message} key={message.id} />
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
    >
      <StatusBar barStyle="dark-content" />
      {activIndicator
        && (
          <View style={styles.indicator}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      <FlatList
        inverted
        data={history}
        keyExtractor={_keyExtractor}
        renderItem={({ item }) => _renderMessageItem(item)}
        onEndReachedThreshold={5}
        onEndReached={getMoreMessages}
      />
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <AutoGrowingTextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="grey"
            value={messageText}
            onChangeText={onTypeMessage}
            maxHeight={170}
            minHeight={50}
            enableScrollToCaret
          />
          <TouchableOpacity style={styles.attachment}>
            <AttachmentIcon name="attachment" size={22} color="#8c8c8c" onPress={sendAttachment} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button}>
          <Icon name="send" size={32} color="blue" onPress={sendMessage} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

Chat.navigationOptions = ({ navigation }) => {
  const goToDetailsScreen = (props) => {
    const { dialog } = navigation.state.params;
    const isNeedFetchUsers = props.getParam('isNeedFetchUsers', false);
    if (dialog.type === DIALOG_TYPE.PRIVATE) {
      props.push('ContactDetails', { dialog });
    } else {
      props.push('GroupDetails', { dialog, isNeedFetchUsers });
    }
  };

  const { dialog, getUsersAvatar } = navigation.state.params;
  let dialogPhoto = '';
  if (dialog.type === DIALOG_TYPE.PRIVATE) {
    dialogPhoto = getUsersAvatar(dialog.occupants_ids);
  } else {
    dialogPhoto = dialog.photo;
  }
  return {
    headerTitle: (
      <Text numberOfLines={3} style={{ fontSize: 22, color: 'black' }}>
        {dialog.name}
      </Text>
    ),
    headerRight: (
      <TouchableOpacity onPress={() => goToDetailsScreen(navigation)}>
        <Avatar
          photo={dialogPhoto}
          name={dialog.name}
          iconSize="small"
        />
      </TouchableOpacity>
    ),
  };
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    paddingVertical: 12,
    paddingHorizontal: 35,
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    paddingTop: 25,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '300',
    color: '#8c8c8c',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    paddingRight: 35,
    backgroundColor: 'whitesmoke',
  },
  button: {
    width: 40,
    height: 50,
    marginBottom: Platform.OS === 'ios' ? 15 : 0,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachment: {
    width: 40,
    height: 50,
    position: 'absolute',
    right: 5,
    bottom: 0,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    marginBottom: Platform.OS === 'ios' ? 15 : 0,
    flexDirection: 'row',
  },
});

export default Chat;
