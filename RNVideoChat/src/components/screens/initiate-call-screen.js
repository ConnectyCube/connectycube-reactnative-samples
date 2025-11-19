import { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, CircleCheckBig, Phone, Video } from 'lucide-react-native';
import { CallType } from '@connectycube/react';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { CallService, AuthService, PushService } from '../../services';
import { getUserById, showToast, isCurrentRoute } from '../../utils';
import LogoutButton from '../generic/logout-button';
import { users } from '../../config';

export default function VideoIncomingCallScreen() {
  const navigation = useNavigation();
  const [selectedOpponents, setSelectedOpponents] = useState([]);
  const streams = useSelector(state => state.activeCall.streams ?? []);
  const isIncoming = useSelector(state => state.activeCall.isIncoming);
  const isIncomingCallScreen = useSelector(state => state.activeCall.isIncomingCallScreen);
  const isEarlyAccepted = useSelector(state => state.activeCall.isEarlyAccepted);
  const isAccepted = useSelector(state => state.activeCall.isAccepted);
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
    const isAlreadyOnIncomingCallScreen = isCurrentRoute(navigation, 'IncomingCallScreen');
    const isAlreadyOnVideoScreenScreen = isCurrentRoute(navigation, 'VideoScreen');

    if (
      isIncoming &&
      isIncomingCallScreen &&
      !isAlreadyOnIncomingCallScreen &&
      !isAlreadyOnVideoScreenScreen
    ) {
      navigation.push('IncomingCallScreen');
    }
  }, [navigation, isIncoming, isIncomingCallScreen]);

  useEffect(() => {
    const isAlreadyOnVideoScreenScreen = isCurrentRoute(navigation, 'VideoScreen');

    if ((isAccepted || isEarlyAccepted) && streams.length > 1 && !isAlreadyOnVideoScreenScreen) {
      navigation.push('VideoScreen');
    }
  }, [navigation, isAccepted, isEarlyAccepted, streams]);

  const selectUser = opponent => {
    setSelectedOpponents([...selectedOpponents, opponent]);
  };

  const unselectUser = opponent => {
    setSelectedOpponents(selectedOpponents.filter(op => op.id !== opponent.id));
  };

  const logout = async () => {
    await PushService.deleteSubscriptions();
    await AuthService.logout();
  };

  const startAudioCall = async () => {
    await startCall(CallType.AUDIO);
  };

  const startVideoCall = async () => {
    await startCall(CallType.VIDEO);
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
      callType: callType === CallType.VIDEO ? 'video' : 'audio',
    };
    PushService.sendPushNotification(selectedOpponentsIds, pushParams); // send push notification to opponents
    navigation.push('VideoScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select users to start a call</Text>
      {opponents.map(opponent => {
        const id = opponent.id;
        const user = getUserById(id);
        const selected = selectedOpponents.some(item => id === item.id);
        const RadioIcon = selected
          ? CircleCheckBig
          : Circle;
        const onPress = selected ? unselectUser : selectUser;

        return (
          <TouchableOpacity
            key={id}
            style={styles.userLabel(user.color)}
            onPress={() => onPress(opponent)}>
            <Text numberOfLines={1} style={styles.userName}>{user?.full_name ?? 'Unknown'}</Text>
            <RadioIcon size={20} color="white" />
          </TouchableOpacity>
        );
      })}
      <View style={styles.startCallButtonsContainer}>
        <TouchableOpacity
          style={[styles.buttonStartCall]}
          onPress={startAudioCall}>
          <Phone size={32} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buttonStartCall]}
          onPress={startVideoCall}>
          <Video size={32} color="white" />
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
