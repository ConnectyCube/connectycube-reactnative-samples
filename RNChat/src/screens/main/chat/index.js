import React, { useState, useLayoutEffect, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Pressable,
} from 'react-native';
import { KeyboardAvoidingView, KeyboardStickyView, } from 'react-native-keyboard-controller';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Paperclip, Send } from 'lucide-react-native';
import { ChatService, UsersService } from '../../../services';
import Message from './message';
import Avatar from '../../components/avatar';
import ImagePicker from 'react-native-image-crop-picker';
import { DIALOG_TYPE } from '../../../helpers/constants';
import { isIOS } from '../../../helpers/platform';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardOffset from '../../../hooks/useKeyboardOffset';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';

const INPUT_OFFSET = 15;

export default function Chat() {
  const route = useRoute();
  const inputRef = useRef(null);
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();
  const dialog = route.params.dialog;
  const history = useSelector((state) => state.messages[dialog.id]);
  const user = useSelector((state) => state.currentUser?.user);
  const bottomOffset = bottom > INPUT_OFFSET ? bottom : INPUT_OFFSET;
  const [activityIndicator, setActivityIndicator] = useState(true);
  const [messageText, setMessageText] = useState('');

  const needToGetMoreMessage = useRef(false);

  const inputHeight = inputRef.current?.clientHeight ?? 50;

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
      {activityIndicator && <ActivityIndicator size="large" color="blue" className="absolute z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />}
      <KeyboardAvoidingView className="flex-1 relative" behavior="padding" keyboardVerticalOffset={isLiquidGlassSupported ? keyboardOffset - bottomOffset + INPUT_OFFSET : bottomOffset + INPUT_OFFSET + 50}>
        <FlatList
          inverted
          data={history}
          keyExtractor={_keyExtractor}
          renderItem={({ item }) => _renderMessageItem(item)}
          onEndReachedThreshold={5}
          onEndReached={getMoreMessages}
          contentContainerStyle={{ marginTop: inputHeight + bottomOffset + INPUT_OFFSET }}
          className="flex-1 bg-gray-300"
        />
      </KeyboardAvoidingView>
      <KeyboardStickyView style={styles.container} offset={{ closed: -bottomOffset, opened: -INPUT_OFFSET }}>
        {isLiquidGlassSupported ? (<>
          <LiquidGlassView interactive effect="clear" style={styles.button}>
            <Paperclip size={28} color="#8c8c8c" onPress={sendAttachment} hitSlop={20} />
          </LiquidGlassView>
          <LiquidGlassView interactive effect="clear" style={{ borderRadius: 25, overflow: 'hidden', flexGrow: 1 }}>
            <TextInput
              ref={inputRef}
              multiline
              autoCorrect={false}
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="grey"
              value={messageText}
              onChangeText={setMessageText}
              enableScrollToCaret
            />
          </LiquidGlassView>
          <LiquidGlassView interactive effect="clear" style={styles.button}>
            <Pressable onPress={sendMessage} hitSlop={30}>
              <Send size={28} color='#8c8c8c' style={{ backgroundColor: 'transparent' }} />
            </Pressable>
          </LiquidGlassView>
        </>) : (<>
          <View className="border border-gray-400 rounded-[25px] size-[50px] justify-center items-center bg-white">
            <Paperclip size={28} color="#8c8c8c" onPress={sendAttachment} hitSlop={20} />
          </View>
          <View className="border border-gray-400 rounded-[25px] flex-1 bg-white">
            <TextInput
              ref={inputRef}
              multiline
              autoCorrect={false}
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="grey"
              value={messageText}
              onChangeText={setMessageText}
              enableScrollToCaret
            />
          </View>
          <View className="border border-gray-400 rounded-[25px] size-[50px] justify-center items-center bg-white">
            <Pressable onPress={sendMessage} hitSlop={30}>
              <Send size={28} color='#8c8c8c' style={{ backgroundColor: 'transparent' }} />
            </Pressable>
          </View>
        </>)}
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  chatView: {
    backgroundColor: 'whitesmoke',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginHorizontal: INPUT_OFFSET,
  },
  textInput: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '300',
    color: '#8c8c8c',
    paddingHorizontal: 12,
    paddingVertical: isIOS ? 14 : 10,
    minHeight: 50,
    maxHeight: 116,
    borderRadius: 25,
    overflow: 'hidden',
  },
  button: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '100%',
  },
});
