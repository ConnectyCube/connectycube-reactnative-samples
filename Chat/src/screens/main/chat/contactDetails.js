import React, { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, } from 'react-native'
import Avatar from '../../components/avatar'
import ChatService from '../../../services/chat-service'
import UsersService from '../../../services/users-service'
import Indicator from '../../components/indicator'
import { popToTop } from '../../../routing/init'
import { DIALOG_TYPE } from '../../../helpers/constants'

export default function ContactDetails ({navigation}) {
  const [isLoader, setIsLoader] = useState(false);

  const dialog = navigation.getParam('dialog', false)

  const gotToChat = () => {
    if (dialog.name) {
      navigation.goBack()
    } else {
      setIsLoader(true)

      ChatService.createPrivateDialog(dialog.id)
        .then((newDialog) => {
          setIsLoader(false)

          navigation.dispatch(popToTop)
          navigation.push('Chat', { dialog: newDialog })
        })
    }
  }

  const dialogPhoto = dialog?.type === DIALOG_TYPE.PRIVATE ? UsersService.getUsersAvatar(dialog.occupants_ids) : dialog.avatar

  return (
    <View style={styles.container}>
      {isLoader && (
        <Indicator color={'red'} size={40} />
      )}
      <Avatar
        photo={dialogPhoto}
        name={dialog.name || dialog.full_name}
        iconSize="extra-large"
      />
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{dialog.name || dialog.full_name}</Text>
      </View>
      <TouchableOpacity onPress={gotToChat}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonLabel}>Start a chat</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nameContainer: {
    marginVertical: 70,
    borderBottomWidth: 1,
    borderColor: 'grey',
    width: '40%'
  },
  name: {
    fontSize: 18,
    textAlign: 'center',
    padding: 5,
    color: 'grey',
  },
  buttonContainer: {
    height: 50,
    width: 200,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#00e3cf',
    backgroundColor: '#00e3cf',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700'
  },
})