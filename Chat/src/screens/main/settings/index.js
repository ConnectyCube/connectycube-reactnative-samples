import React, { useState, useRef } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert } from 'react-native'
import AuthService from '../../../services/auth-service'
import Indicator from '../../components/indicator'
import { showAlert } from '../../../helpers/alert'
import ImgPicker from '../../components/imgPicker'

export default function Settings ({navigation}) {

  const user = navigation.getParam('user')

  const [isLoader, setIsLoader] = useState(false);
  const [login, setLogin] = useState(user.login);
  const [name, setName] = useState(user.full_name);
  const [photo, setPhoto] = useState(null);

  const inputRef = useRef(null);

  const onPickPhoto = (image) => {
    setPhoto(image)
  }

  const onCancelPickPhoto = () => {

  }

  const onSaveProfile = () => {
    const user = navigation.getParam('user')

    inputRef.current.blur()

    const newData = {}
    if (user.full_name !== name) {
      newData.full_name = name
    }
    if (user.login !== login) {
      newData.login = login
    }
    if (photo) {
      newData.image = photo
    }
    if (Object.keys(newData).length === 0) {
      return
    }

    setIsLoader(true)

    AuthService.updateCurrentUser(newData)
      .then(() => {
        setIsLoader(false)
        showAlert('User profile is updated successfully')
      })
      .catch((error) => {
        setIsLoader(false)
        showAlert(error)
      })
  }

  const onUserLogout = () => {
    Alert.alert(
      'Are you sure you want to logout?',
      '',
      [
        {
          text: 'Yes',
          onPress: () => {
            AuthService.logout()
          }
        },
        {
          text: 'Cancel'
        }
      ],
      { cancelable: false }
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      {isLoader &&
        <Indicator size={40} color={'blue'} />
      }
      <ImgPicker name={user.full_name} photo={user.avatar} onPickPhoto={onPickPhoto} onCancelPickPhoto={onCancelPickPhoto} />
      <View style={styles.inputWrap}>
        <View>
          <TextInput
            style={styles.input}
            ref={inputRef}
            autoCapitalize="none"
            placeholder="Change name ..."
            placeholderTextColor="grey"
            onChangeText={setName}
            value={name}
            maxLength={100}
          />
          <View style={styles.subtitleWrap}>
            <Text style={styles.subtitleInpu}>Change name</Text>
          </View>
        </View>
        <View>
          <TextInput
            style={styles.input}
            ref={inputRef}
            autoCapitalize="none"
            placeholder="Change login ..."
            placeholderTextColor="grey"
            onChangeText={setLogin}
            value={login}
            maxLength={100}
          />
          <View style={styles.subtitleWrap}>
            <Text style={styles.subtitleInpu}>Change login</Text>
          </View>
        </View>
      </View>
      <View>
        <TouchableOpacity onPress={onSaveProfile}>
          <View style={styles.buttonContainerSave}>
            <Text style={styles.buttonLabelSave}>Save</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View>
        <TouchableOpacity onPress={onUserLogout}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonLabel}>logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    marginTop: 40,
    height: 50,
    width: 200,
    borderRadius: 25,
    backgroundColor: '#00e3cf',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700'
  },
  buttonContainerSave: {
    height: 50,
    width: 200,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#00e3cf',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonLabelSave: {
    color: '#00e3cf',
    fontSize: 20,
    fontWeight: '700'
  },
  inputWrap: {
    marginVertical: 20
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    color: 'black',
    width: 200,
    marginVertical: 15,
    padding: 7,
    paddingTop: 15,
    fontSize: 17
  },
  subtitleInpu: {
    color: 'grey'
  },
  subtitleWrap: {
    position: 'absolute',
    marginVertical: -7,
    bottom: 0,
  }
})