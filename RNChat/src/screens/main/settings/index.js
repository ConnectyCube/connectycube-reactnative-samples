import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { AuthService } from '../../../services';
import Indicator from '../../components/indicator';
import { showAlert } from '../../../helpers/alert';
import ImgPicker from '../../components/imgPicker';
import { useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useKeyboardOffset from '../../../hooks/useKeyboardOffset';
import { isIOS } from '../../../helpers/platform';

export default function Settings() {
  const { bottom } = useSafeAreaInsets();
  const keyboardOffset = useKeyboardOffset();
  const route = useRoute();
  const { user } = route.params;

  const [isLoader, setIsLoader] = useState(false);
  const [login, setLogin] = useState(user.login);
  const [name, setName] = useState(user.full_name);
  const [photo, setPhoto] = useState(null);

  const inputRef = useRef(null);

  const onPickPhoto = (image) => {
    setPhoto(image);
  };

  const onCancelPickPhoto = () => { };

  const onSaveProfile = () => {
    inputRef.current.blur();

    const newData = {};
    if (user.full_name !== name) {
      newData.full_name = name;
    }
    if (user.login !== login) {
      newData.login = login;
    }
    if (photo) {
      newData.image = photo;
    }
    if (Object.keys(newData).length === 0) {
      return;
    }

    setIsLoader(true);

    AuthService.updateCurrentUser(newData)
      .then(() => {
        setIsLoader(false);
        showAlert('User profile is updated successfully');
      })
      .catch((error) => {
        setIsLoader(false);
        showAlert(error);
      });
  };

  const onUserLogout = () => {
    Alert.alert(
      'Are you sure you want to logout?',
      '',
      [
        {
          text: 'Yes',
          onPress: () => {
            AuthService.logout();
          },
        },
        {
          text: 'Cancel',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container(bottom)} behavior="padding" keyboardVerticalOffset={keyboardOffset} >
      <Indicator isActive={isLoader} />
      <View style={styles.topContainer}>
        <ImgPicker name={user.full_name} photo={user.avatar} onPickPhoto={onPickPhoto} onCancelPickPhoto={onCancelPickPhoto} />
        <View style={styles.inputWrap}>
          <View style={styles.inputContainer}>
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
            <Text style={styles.subtitleInput}>Change name</Text>
          </View>
          <View style={styles.inputContainer}>
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
            <Text style={styles.subtitleInput}>Change login</Text>
          </View>
        </View>
      </View>
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={onSaveProfile}>
          <View style={[styles.buttonContainer, styles.buttonContainerSave]}>
            <Text style={[styles.buttonLabel, styles.buttonLabelSave]}>Save</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onUserLogout}>
          <View style={[styles.buttonContainer, styles.buttonContainerExit]}>
            <Text style={[styles.buttonLabel, styles.buttonLabelExit]}>Log out</Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView >
  );
}

const styles = StyleSheet.create({
  container: (marginBottom = 0) => ({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom,
  }),
  topContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputWrap: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 10,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    color: 'black',
    width: '100%',
    paddingVertical: isIOS ? 5 : 0,
    paddingHorizontal: 5,
    fontSize: 16,
  },
  bottomContainer: {
    gap: 20,
    alignItems: 'stretch',
    justifyContent: 'center',
    width: '100%',
    padding: 20,
  },
  buttonContainer: {
    height: 50,
    width: '100%',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainerSave: {
    backgroundColor: '#ffffff',
    borderColor: '#00e3cf',
    borderWidth: 1,
  },
  buttonContainerExit: {
    backgroundColor: '#00e3cf',
    borderColor: '#ffffff',
  },
  buttonLabel: {
    fontSize: 21,
    fontWeight: '700',
  },
  buttonLabelSave: {
    color: '#00e3cf',
  },
  buttonLabelExit: {
    color: '#ffffff',
  },
  subtitleInput: {
    color: 'grey',
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
});
