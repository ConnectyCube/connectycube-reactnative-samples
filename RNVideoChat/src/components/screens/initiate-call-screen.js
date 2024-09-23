import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ConnectyCube from 'react-native-connectycube';
import { useSelector } from 'react-redux';
import { CallService, AuthService, PushNotificationsService } from '../../services';
import { getUserById, showToast, isCurrentRoute } from '../../utils';
import LogoutButton from '../../components/generic/logout-button';
import store, { resetStore } from '../../redux/store';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function VideoIncomingCallScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const opponents = route.params?.opponents;
  const [selectedOpponents, setSelectedOpponents] = useState([]);
  const callSession = useSelector(state => state.activeCall.session);
  const isIncoming = useSelector(state => state.activeCall.isIncoming);
  const isEarlyAccepted = useSelector(state => state.activeCall.isEarlyAccepted);
  const currentUser = useSelector(state => state.currentUser);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: currentUser.full_name,
      headerRight: () => <LogoutButton onPress={logout} />,
    });
  }, [navigation, currentUser, logout]);

  useEffect(() => {
    if (isIncoming && !isEarlyAccepted) {
      const isAlreadyOnIncomingCallScreen = isCurrentRoute(navigation, 'IncomingCallScreen');
      const isAlreadyOnVideoScreenScreen = isCurrentRoute(navigation, 'VideoScreen');
      if (!isAlreadyOnIncomingCallScreen && !isAlreadyOnVideoScreenScreen) {
        // incoming call
        navigation.push('IncomingCallScreen', {});
      }
    }
  }, [navigation, callSession, isIncoming, isEarlyAccepted]);

  useEffect(() => {
    if (isEarlyAccepted) {
      navigation.push('VideoScreen', {});
    }
  }, [navigation, isEarlyAccepted]);

  const selectUser = opponent => {
    setSelectedOpponents([...selectedOpponents, opponent]);
  };

  const unselectUser = opponent => {
    setSelectedOpponents(selectedOpponents.filter(op => op.id !== opponent.id));
  };

  const logout = useCallback(async () => {
    await AuthService.logout();
    PushNotificationsService.deleteSubscription();
    store.dispatch(resetStore());
    navigation.popToTop();
  }, [navigation]);

  const startAudioCall = async () => {
    await startCall(ConnectyCube.videochat.CallType.AUDIO);
  };

  const startVideoCall = async () => {
    await startCall(ConnectyCube.videochat.CallType.VIDEO);
  };

  const startCall = async (callType) => {
    if (selectedOpponents.length === 0) {
      showToast('Please select at least one user');
      return;
    }

    const selectedOpponentsIds = selectedOpponents.map(op => op.id);

    ConnectyCube.videochat.CallType.AUDIO;

    // 1. initiate a call
    //
    const callSession = await CallService.startCall(selectedOpponentsIds, callType);

    // 2. send push notitification to opponents
    //
    const pushParams = {
      message: `Incoming call from ${currentUser.full_name}`,
      ios_voip: 1,
      handle: currentUser.full_name,
      initiatorId: callSession.initiatorID,
      opponentsIds: selectedOpponentsIds.join(','),
      uuid: callSession.ID,
      callType: callType === ConnectyCube.videochat.CallType.VIDEO ? 'video' : 'audio',
    };
    PushNotificationsService.sendPushNotification(selectedOpponentsIds, pushParams);

    navigation.push('VideoScreen', {});
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Select users to start a call</Text>
        {opponents.map(opponent => {
          const id = opponent.id;
          const user = getUserById(id);
          const selected = selectedOpponents.some(opponent => id === opponent.id);
          const type = selected
            ? 'radio-button-checked'
            : 'radio-button-unchecked';
          const onPress = selected ? unselectUser : selectUser;

          return (
            <TouchableOpacity
              key={id}
              style={styles.userLabel(user.color)}
              onPress={() => onPress(opponent)}>
              <Text style={styles.userName}>{user.full_name}</Text>
              <MaterialIcon name={type} size={20} color="white" />
            </TouchableOpacity>
          );
        })}
        <View style={styles.startCallButtonsContainer}>
          <TouchableOpacity
            style={[styles.buttonStartCall]}
            onPress={startAudioCall}>
            <MaterialIcon name={'call'} size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonStartCall]}
            onPress={startVideoCall}>
            <MaterialIcon name={'videocam'} size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startCallButtonsContainer: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    color: '#1198d4',
    padding: 20,
  },
  userLabel: backgroundColor => ({
    backgroundColor,
    width: 150,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 5,
  }),
  userName: { color: 'white', fontSize: 20 },
  buttonStartCall: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginHorizontal: 25,
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
});
