import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { CallService } from '../../services';
import { getUserById, showToast } from '../../utils';

export default function IncomingCallScreen() {
  const navigation = useNavigation();
  const callSession = useSelector(store => store.activeCall.session);
  const isCallAccepted = useSelector(store => store.activeCall.isAccepted);
  const isCallEarlyAccepted = useSelector(store => store.activeCall.isEarlyAccepted);
  const initiatorId = Number(callSession?.initiatorID);
  const callType = callSession?.callType === 1 ? 'video' : 'audio';
  const initiatorName = getUserById(initiatorId, 'full_name') ?? 'Unknown';
  const incomingCallText = `Incoming ${callType} call from ${initiatorName}`;

  const acceptCall = useCallback(async () => {
    if (typeof callSession.accept === 'function') {
      await CallService.acceptCall();
    }
  }, [callSession]);

  const rejectCall = useCallback(() => {
    if (typeof callSession.reject === 'function') {
      CallService.rejectCall();
    }
  }, [callSession]);

  useEffect(() => {
    if (!callSession) {
      navigation.goBack();
      showToast('Call is ended');
    }
  }, [navigation, callSession]);

  useEffect(() => {
    if (isCallAccepted) {
      navigation.replace('VideoScreen');
    }
  }, [navigation, isCallAccepted]);

  useEffect(() => {
    if (isCallEarlyAccepted) {
      acceptCall();
    }
  }, [acceptCall, isCallEarlyAccepted]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerName}>
        <Text style={styles.incomingCallText}>{incomingCallText}</Text>
      </View>
      <View style={styles.containerButtons}>
        <TouchableOpacity
          style={[styles.button, styles.buttonAcceptCall]}
          onPress={acceptCall}>
          <MaterialIcon name={'call'} size={40} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonRejectCall]}
          onPress={rejectCall}>
          <MaterialIcon name={'call-end'} size={40} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'stretch',
    backgroundColor: 'black',
  },
  containerName: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  incomingCallText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  containerButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 50,
  },
  button: {
    height: 80,
    width: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonAcceptCall: {
    backgroundColor: 'green',
  },
  buttonRejectCall: {
    backgroundColor: 'red',
  },
});
