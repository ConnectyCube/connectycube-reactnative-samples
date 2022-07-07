import React, { } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

export default function IncomingCallScreen ({ route }) {

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
      <StatusBar backgroundColor="black" barStyle="light-content" />

    </SafeAreaView>
  );
}

  // async function _onPressAccept(){
  //   const stream = await CallService.acceptCall(_session.current)

  //   const {opponentsIDs, initiatorID, currentUserID} = _session.current;
  //   const _oIds = [initiatorID, ...opponentsIDs].filter(
  //     userId => currentUserID !== userId,
  //   );

  //   initRemoteStreams(_oIds);
  //   setLocalStream(stream);
  //   // setIsSelectUsersViewDisplayed(false)

  //   clearCall();
  // };