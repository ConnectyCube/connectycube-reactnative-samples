import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import CallService from '../../services/call-service';
import { getUserById, showToast } from '../../utils'

export default function IncomingCallScreen ({ navigation }) {

  const callSession = useSelector(store => store.activeCall.session);
  const isCallAccepted = useSelector(store => store.activeCall.isAccepted); 
  const initiatorName = getUserById(callSession?.initiatorID)?.full_name;
  const icomingCallText = `${initiatorName} is calling`;

  useEffect(() => {
    // hide screen if call rejected/canceled
    if (!callSession) {
      console.log("[IncomingCallScreen][useEffect] Call is ended");
      // 
      navigateBack()
      showToast("Call is ended")
    }
  }, [callSession]);

  useEffect(() => {
    if (isCallAccepted) {
      navigateBack();
      navigation.push('VideoScreen', { });
    }
  }, [isCallAccepted]);

  const acceptCall = async () => {
    await CallService.acceptCall();
  }

  const rejectCall = () => {
    CallService.rejectCall();

    navigateBack();
  }

  function navigateBack() {
    navigation.pop();
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <View style={styles.container}>
        {initiatorName && <Text style={styles.incomingCallText}>{icomingCallText}</Text>}
        <View style={styles.containerButtons}>
          <TouchableOpacity
            style={[styles.buttonAcceptCall]}
            onPress={acceptCall}>
            <MaterialIcon name={'call'} size={32} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonRejectCall]}
            onPress={rejectCall}>
            <MaterialIcon name={'call-end'} size={32} color="white" />
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
    justifyContent: 'space-around',
    alignItems: 'stretch',
  },
  containerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  incomingCallText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  buttonAcceptCall: {
    height: 50,
    width: 50,
    borderRadius: 25,
    // marginHorizontal: 25,
    // marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'green',
  },
  buttonRejectCall: {
    height: 50,
    width: 50,
    borderRadius: 25,
    // marginHorizontal: 25,
    // marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
});