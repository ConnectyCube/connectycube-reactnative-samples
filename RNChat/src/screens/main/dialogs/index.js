import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, StatusBar, TouchableOpacity, Platform } from 'react-native';

import Dialog from './elements/dialog';
import ChatContext from '../../../services/chat-service';
import Indicator from '../../components/indicator';
import CreateBtn from '../../components/createBtn';
import { BTN_TYPE } from '../../../helpers/constants';
import Avatar from '../../components/avatar';
import PushNotificationContext from '../../../services/push-notification';
import AuthContext from '../../../services/auth-service';

const Dialogs = ({ navigation }) => {
  const ChatService = useContext(ChatContext);
  const { dialogs } = ChatService;
  const PushNotificationService = useContext(PushNotificationContext);
  const [isLoader, setIsLoader] = useState(dialogs.length === 0 && true);
  const { currentUser } = useContext(AuthContext);
  const [didLoad, setDidLoad] = useState(false);
  const [dialogsLocal, setDialogsLocal] = useState([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    ChatService.setUpListeners();
    await ChatService.fetchDialogsFromServer();
    PushNotificationService.init(navigation);
    setDidLoad(true);
  };

  useEffect(() => {
    if (currentUser?.user.full_name !== Dialogs.currentUserInfo.full_name) {
      Dialogs.currentUserInfo = { ...currentUser.user };
    }
  }, [currentUser?.user.full_name]);

  useEffect(() => {
    if (didLoad) {
      setDialogsLocal(dialogs);
      setIsLoader(false);
    }
  }, [dialogs, didLoad]);

  const keyExtractor = (item, index) => index.toString();

  const _renderDialog = ({ item }) => (
    <Dialog dialog={item} navigation={navigation} />
  );

  const goToContactsScreen = () => {
    navigation.push('Contacts');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {isLoader
        ? (
          <Indicator color="red" size={40} />
        ) : dialogsLocal.length === 0
          ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 19 }}>No chats yet</Text>
            </View>
          )
          : (
            <FlatList
              data={dialogsLocal}
              keyExtractor={keyExtractor}
              renderItem={(item) => _renderDialog(item)}
            />
          )}
      <CreateBtn goToScreen={goToContactsScreen} type={BTN_TYPE.DIALOG} />
    </View>
  );
};

Dialogs.navigationOptions = ({ navigation }) => {
  Dialogs.currentUserInfo = { ...navigation.state.params.currentUser.user };
  return {
    headerTitle: (
      <Text style={[
        { fontSize: 22, color: 'black' },
        Platform.OS === 'android'
          ? { paddingLeft: 13 }
          : { paddingLeft: 0 }]}
      >
        {Dialogs.currentUserInfo.full_name}
      </Text>
    ),
    headerRight: (
      <TouchableOpacity onPress={() => goToSettingsScreen(navigation)}>
        <Avatar
          photo={Dialogs.currentUserInfo.avatar}
          name={Dialogs.currentUserInfo.full_name}
          iconSize="small"
        />
      </TouchableOpacity>
    ),
  };
};

const goToSettingsScreen = (props) => {
  props.push('Settings', { user: Dialogs.currentUserInfo });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dialogs;
