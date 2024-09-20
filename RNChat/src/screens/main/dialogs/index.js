import React, { useState, useLayoutEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Dialog from './elements/dialog';
import { ChatService, PushNotificationService } from '../../../services';
import Indicator from '../../components/indicator';
import CreateBtn from '../../components/createBtn';
import { BTN_TYPE } from '../../../helpers/constants';
import Avatar from '../../components/avatar';
import customEventEmitter, { CUSTOM_EVENTS } from '../../../events';

export default function Dialogs() {
  const navigation = useNavigation();
  const dialogs = useSelector((state) => state.dialogs);
  const currentUser = useSelector((state) => state.currentUser?.user);
  const [isLoader, setIsLoader] = useState(false);

  useLayoutEffect(() => {
    setIsLoader(true);

    ChatService.fetchDialogsFromServer()
      .then(() => {
        PushNotificationService.init();
      }).finally(() => {
        setIsLoader(false);
      });

    customEventEmitter.addListener(
      CUSTOM_EVENTS.ON_NOTIFICATION_OPEN,
      onNotificationOpen,
    );
  }, [onNotificationOpen]);

  const onNotificationOpen = useCallback(async dialogId => {
    const dialog = await ChatService.fetchDialogById(dialogId, true);

    if (dialog) {
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Dialogs' },
          { name: 'Chat', params: { dialog } },
        ],
      });
    }
  }, [navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: currentUser.full_name,
      headerRight: () =>
        <TouchableOpacity onPress={goToSettingsScreen}>
          <Avatar
            photo={currentUser.avatar}
            name={currentUser.full_name}
            iconSize="small"
          />
        </TouchableOpacity>,
    });
  }, [navigation, currentUser, goToSettingsScreen]);

  const goToSettingsScreen = useCallback(() => {
    navigation.push('Settings', { user: currentUser });
  }, [navigation, currentUser]);

  const keyExtractor = (item, index) => index.toString();

  const _renderDialog = ({ item }) => {
    return (
      <Dialog dialog={item} onDialogClick={onDialogClick} />
    );
  };

  const onDialogClick = useCallback((dialog) => {
    navigation.push('Chat', { dialog });
  }, [navigation]);

  const goToContactsScreen = useCallback(() => {
    navigation.push('Contacts');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Indicator isActive={isLoader} />
      {dialogs.length === 0
        ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No chats yet</Text>
          </View>
        ) : (
          <FlatList
            data={dialogs}
            keyExtractor={keyExtractor}
            renderItem={(item) => _renderDialog(item)}
          />
        )
      }
      <CreateBtn goToScreen={goToContactsScreen} type={BTN_TYPE.DIALOG} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: 'black',
  },
});
