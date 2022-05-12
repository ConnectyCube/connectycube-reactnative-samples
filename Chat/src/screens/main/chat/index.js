import React, { useState, useLayoutEffect, useEffect, useRef } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native'
import { useSelector } from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialIcons'
import AttachmentIcon from 'react-native-vector-icons/Entypo'
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'
import ChatService from '../../../services/chat-service'
import UsersService from '../../../services/users-service'
import Message from './message'
import Avatar from '../../components/avatar'
import ImagePicker from 'react-native-image-crop-picker'
import { DIALOG_TYPE } from '../../../helpers/constants'

export default function Chat ({ route, navigation }) {
  const { dialog } = route.params;

  const history = useSelector((state) => state.messages[dialog.id]);
  const currentUser = useSelector((state) => state.currentUser);

  const [activIndicator, setActivIndicator] = useState(true);
  const [messageText, setMessageText] = useState('');

  const needToGetMoreMessage = useRef(false);

  useEffect(() => {
    setActivIndicator(true)
    
    ChatService.getMessagesAndStore(dialog)
      .catch(e => alert(`Error.\n\n${JSON.stringify(e)}`))
      .then(messagesRetrievedCount => {
        needToGetMoreMessage.current = messagesRetrievedCount === 100;
        setActivIndicator(false)
      })

    return () => {
      ChatService.resetSelectedDialogs()
    }
  }, []);

  useLayoutEffect(() => {
    const dialogPhoto = dialog.type === DIALOG_TYPE.PRIVATE 
      ? UsersService.getUsersAvatar(dialog.occupants_ids)
      : dialog.photo;

    navigation.setOptions({
      headerTitle: () => (
        <Text numberOfLines={3} style={{ fontSize: 22, color: 'black' }}>
          {dialog.name}
        </Text>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => goToDetailsScreen()}>
          <Avatar
            photo={dialogPhoto}
            name={dialog.name}
            iconSize="small"
          />
        </TouchableOpacity>
      )
    })
  }, [navigation]);

  const getMoreMessages = () => {
    if (needToGetMoreMessage.current) {
      setActivIndicator(true)

      ChatService.getMoreMessages(dialog)
        .then(messagesRetrievedCount => {
          needToGetMoreMessage.current = messagesRetrievedCount === 100;
          setActivIndicator(true)
        })
    }
  }

  const goToDetailsScreen = () => {
    const isNeedFetchUsers = route.params?.isNeedFetchUsers || false;
    if (dialog.type === DIALOG_TYPE.PRIVATE) {
      navigation.push('ContactDetails', { dialog })
    } else {
      navigation.push('GroupDetails', { dialog, isNeedFetchUsers })
    }
  }

  const sendMessage = async () => {
    if (messageText.length <= 0) {
      return
    }

    await ChatService.sendMessage(dialog, messageText)

    setMessageText("")
  }

  const sendAttachment = async () => {
    const img = await onPickImage()
    ChatService.sendMessage(dialog, '', img)
  }

  const onPickImage = () => {
    return ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true
    }).then(image => {
      return image
    }).catch(e => {
      
    })
  }

  const _keyExtractor = (item, index) => index.toString()

  const _renderMessageItem = (message) => {
    const { user } = currentUser
    const isOtherSender = message.sender_id !== user.id ? true : false
    return (
      <Message 
        message={message} 
        messageSendState={message.send_state} 
        messageAttachments={message.attachment}
        otherSender={isOtherSender} 
        key={message.id} />
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
    >
      <StatusBar barStyle="dark-content" />
      {activIndicator &&
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
      />
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <AutoGrowingTextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="grey"
            value={messageText}
            onChangeText={setMessageText}
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
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    paddingVertical: 12,
    paddingHorizontal: 35
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
    flexDirection: 'row'
  }
});