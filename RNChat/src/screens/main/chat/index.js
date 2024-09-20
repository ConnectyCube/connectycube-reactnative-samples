import React, { useState, useLayoutEffect, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AttachmentIcon from 'react-native-vector-icons/Entypo';
import { ChatService, UsersService } from '../../../services';
import Message from './message';
import Avatar from '../../components/avatar';
import ImagePicker from 'react-native-image-crop-picker';
import { DIALOG_TYPE } from '../../../helpers/constants';
import { isIOS } from '../../../helpers/platform';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardOffset from '../../../hooks/useKeyboardOffset';

export default function Chat() {
  const route = useRoute();
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();
  const dialog = route.params.dialog;
  const history = useSelector((state) => state.messages[dialog.id]);
  const user = useSelector((state) => state.currentUser?.user);

  const [activityIndicator, setActivityIndicator] = useState(true);
  const [messageText, setMessageText] = useState('');

  const needToGetMoreMessage = useRef(false);

  useEffect(() => {
    setActivityIndicator(true);

    ChatService.getMessagesAndStore(dialog)
      .then(messagesRetrievedCount => {
        needToGetMoreMessage.current = messagesRetrievedCount === 100;
        setActivityIndicator(false);
      });

    return () => {
      ChatService.resetSelectedDialogs();
    };
  }, [dialog]);

  useLayoutEffect(() => {
    const dialogPhoto = dialog.type === DIALOG_TYPE.PRIVATE
      ? UsersService.getUsersAvatar(dialog.occupants_ids)
      : dialog.photo;

    navigation.setOptions({
      headerTitle: dialog.name,
      headerRight: () => (
        <TouchableOpacity onPress={goToDetailsScreen}>
          <Avatar
            photo={dialogPhoto}
            name={dialog.name}
            iconSize="small"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, dialog, goToDetailsScreen]);

  const getMoreMessages = () => {
    if (needToGetMoreMessage.current) {
      setActivityIndicator(true);

      ChatService.getMoreMessages(dialog)
        .then(messagesRetrievedCount => {
          needToGetMoreMessage.current = messagesRetrievedCount === 100;
          setActivityIndicator(true);
        });
    }
  };

  const goToDetailsScreen = useCallback(() => {
    const isNeedFetchUsers = route.params?.isNeedFetchUsers || false;
    if (dialog.type === DIALOG_TYPE.PRIVATE) {
      navigation.push('ContactDetails', { dialog });
    } else {
      navigation.push('GroupDetails', { dialog, isNeedFetchUsers });
    }
  }, [navigation, dialog, route]);

  const sendMessage = useCallback(() => {
    if (messageText.length <= 0) {
      return;
    }

    ChatService.sendMessage(dialog, messageText);

    setMessageText('');
  }, [dialog, messageText]);

  const sendAttachment = async () => {
    const img = await onPickImage();
    ChatService.sendMessage(dialog, '', img);
  };

  const onPickImage = async () => {
    const image = await ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    });

    return image;
  };

  const _keyExtractor = (item, index) => index.toString();

  const _renderMessageItem = (message) => {
    const isOtherSender = message.sender_id !== user?.id ? true : false;
    return (
      <Message
        message={message}
        messageSendState={message.send_state}
        messageAttachments={message.attachment}
        otherSender={isOtherSender}
        key={message.id} />
    );
  };

  return (
    <View style={styles.wrap}>
      <KeyboardAvoidingView style={styles.kbWrap(bottom)} behavior="padding" keyboardVerticalOffset={keyboardOffset}>
        {activityIndicator &&
          (
            <View style={styles.indicator}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )
        }
        <FlatList
          inverted
          data={history}
          keyExtractor={_keyExtractor}
          renderItem={({ item }) => _renderMessageItem(item)}
          onEndReachedThreshold={5}
          onEndReached={getMoreMessages}
          style={styles.chatView}
        />
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <TextInput
              multiline
              autoCorrect={false}
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="grey"
              value={messageText}
              onChangeText={setMessageText}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: 'white',
  },
  kbWrap: (bottom = 0) => ({
    flex: 1,
    marginBottom: bottom,
  }),
  chatView: {
    backgroundColor: 'whitesmoke',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderTopWidth: 1,
    backgroundColor: 'white',
    borderTopColor: 'lightgrey',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 35,
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    paddingTop: 25,
  },
  textInput: {
    flexGrow: 1,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '300',
    color: '#8c8c8c',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingTop: isIOS ? 14 : 10,
    paddingBottom: isIOS ? 14 : 10,
    paddingRight: 35,
    backgroundColor: 'whitesmoke',
    minHeight: 50,
    maxHeight: 116,
  },
  button: {
    width: 40,
    height: 50,
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
    flexDirection: 'row',
  },
});
