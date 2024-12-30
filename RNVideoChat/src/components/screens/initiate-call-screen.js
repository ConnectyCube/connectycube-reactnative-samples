import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ConnectyCube from 'react-native-connectycube';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { CallService, AuthService, PushNotificationsService } from '../../services';
import { getUserById, showToast, isCurrentRoute } from '../../utils';
import LogoutButton from '../../components/generic/logout-button';
import { users } from '../../config';

export default function VideoIncomingCallScreen() {
  const navigation = useNavigation();
  const [selectedOpponents, setSelectedOpponents] = useState([]);
  const streams = useSelector(state => state.activeCall.streams ?? []);
  const callSession = useSelector(state => state.activeCall.session);
  const isIncoming = useSelector(state => state.activeCall.isIncoming);
  const isEarlyAccepted = useSelector(state => state.activeCall.isEarlyAccepted);
  const currentUser = useSelector(state => state.currentUser);
  const opponents = users.filter(({ id }) => id !== currentUser.id);

  useLayoutEffect(() => {
    if (currentUser) {
      navigation.setOptions({
        title: currentUser?.full_name,
        headerRight: () => <LogoutButton onPress={logout} />,
      });
    }
  }, [navigation, currentUser]);

  useEffect(() => {
    if (isIncoming && !isEarlyAccepted) {
      const isAlreadyOnIncomingCallScreen = isCurrentRoute(navigation, 'IncomingCallScreen');
      const isAlreadyOnVideoScreenScreen = isCurrentRoute(navigation, 'VideoScreen');
      if (!isAlreadyOnIncomingCallScreen && !isAlreadyOnVideoScreenScreen) {
        navigation.push('IncomingCallScreen');
      }
    }
  }, [navigation, callSession, isIncoming, isEarlyAccepted]);

  useEffect(() => {
    if (isEarlyAccepted && streams.length > 1) {
      navigation.push('VideoScreen');
    }
  }, [navigation, isEarlyAccepted, streams]);

  const selectUser = opponent => {
    setSelectedOpponents([...selectedOpponents, opponent]);
  };

  const unselectUser = opponent => {
    setSelectedOpponents(selectedOpponents.filter(op => op.id !== opponent.id));
  };

  const logout = async () => {
    await PushNotificationsService.deleteSubscription();
    await AuthService.logout();
  };

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

    const selectedOpponentsIds = selectedOpponents.map(({ id }) => id);
    const session = await CallService.startCall(selectedOpponentsIds, callType); // initiate a call
    const pushParams = {
      message: `Incoming call from ${currentUser?.full_name ?? 'Unknown'}`,
      ios_voip: 1,
      handle: currentUser?.full_name,
      initiatorId: session.initiatorID,
      opponentsIds: selectedOpponentsIds.join(','),
      uuid: session.ID,
      callType: callType === ConnectyCube.videochat.CallType.VIDEO ? 'video' : 'audio',
    };
    PushNotificationsService.sendPushNotification(selectedOpponentsIds, pushParams); // send push notification to opponents
    navigation.push('VideoScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select users to start a call</Text>
      {opponents.map(opponent => {
        const id = opponent.id;
        const user = getUserById(id);
        const selected = selectedOpponents.some(item => id === item.id);
        const type = selected
          ? 'radio-button-checked'
          : 'radio-button-unchecked';
        const onPress = selected ? unselectUser : selectUser;

        return (
          <TouchableOpacity
            key={id}
            style={styles.userLabel(user.color)}
            onPress={() => onPress(opponent)}>
            <Text numberOfLines={1} style={styles.userName}>{user?.full_name ?? 'Unknown'}</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
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
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    marginHorizontal: 20,
  }),
  userName: {
    color: 'white',
    fontSize: 20,
    marginRight: 10,
  },
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
