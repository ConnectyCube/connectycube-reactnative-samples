import React, { useEffect, useState, useLayoutEffect } from 'react'
import { StyleSheet, View, FlatList, Text, StatusBar, TouchableOpacity, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import store from '../../../store'
import Dialog from './elements/dialog'
import ChatService from '../../../services/chat-service'
import Indicator from '../../components/indicator'
import CreateBtn from '../../components/createBtn'
import { BTN_TYPE } from '../../../helpers/constants'
import Avatar from '../../components/avatar'
import PushNotificationService from '../../../services/push-notification'
import customEventEmitter, { CUSTOM_EVENTS } from '../../../events';

export default function Dialogs ({ navigation }) {
  const dialogs = useSelector((state) => state.dialogs);
  const currentUser = useSelector((state) => state.currentUser.user);

  const [isLoader, setIsLoader] = useState(false);

  useEffect(() => {
    ChatService.fetchDialogsFromServer()
      .then(() => {
        PushNotificationService.init()
      })

    customEventEmitter.addListener(
      CUSTOM_EVENTS.ON_NOTIFICATION_OPEN,
      onNotificationOpen,
    );
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Text style={[
          { fontSize: 22, color: 'black' },
          Platform.OS === 'android' ?
            { paddingLeft: 13 } :
            { paddingLeft: 0 }]}>
          {currentUser.full_name}
        </Text>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={() => goToSettingsScreen()}>
          <Avatar
            photo={currentUser.avatar}
            name={currentUser.full_name}
            iconSize="small"
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const onNotificationOpen = async (dialogId) => {
    if (dialogId !== store.getState().selectedDialog) {
      const dialog = await ChatService.getDialogById(dialogId)
      navigation.push('Chat', { dialog })
    }
  };

  const goToSettingsScreen = () => {
    navigation.push('Settings', { user: currentUser })
  }

  const keyExtractor = (item, index) => index.toString()

  const _renderDialog = ({ item }) => {
    return (
      <Dialog dialog={item} navigation={navigation} />
    )
  }

  const goToContactsScreen = () => {
    navigation.push('Contacts')
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'dark-content'} />
      {isLoader ?
        (
          <Indicator color={'red'} size={40} />
        ) : dialogs.length === 0 ?
          (<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 19, color: 'grey' }}>No chats yet</Text>
          </View>
          ) :
          (
            <FlatList
              data={dialogs}
              keyExtractor={keyExtractor}
              renderItem={(item) => _renderDialog(item)}
            />
          )
      }
      <CreateBtn goToScreen={goToContactsScreen} type={BTN_TYPE.DIALOG} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})