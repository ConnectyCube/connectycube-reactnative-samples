import React, { useState, useContext, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert } from 'react-native';

import AuthContext from '../../../services/auth-service';
import Indicator from '../../components/indicator';
import { showAlert } from '../../../helpers/alert';
import ImgPicker from '../../components/imgPicker';

const Settings = ({ navigation }) => {
  const AuthService = useContext(AuthContext);
  const user = navigation.getParam('user');
  const [isLoader, setIsLoader] = useState(false);
  const [login, setLogin] = useState(user.login);
  const [name, setName] = useState(user.full_name);
  const input = useRef(null);

  let isPickImage = null;

  const pickPhoto = (image) => {
    isPickImage = image;
  };

  const onSaveProfile = async () => {
    const user = navigation.getParam('user');
    input.current.blur();
    const newData = {};
    if (user.full_name !== name) {
      newData.full_name = name;
    }
    if (user.login !== login) {
      newData.login = login;
    }
    if (isPickImage) {
      newData.image = isPickImage;
    }
    if (Object.keys(newData).length === 0) {
      return;
    }
    setIsLoader(true);
    try {
      await AuthService.updateCurrentUser(newData);
      setIsLoader(false);
      showAlert('User profile is updated successfully');
    } catch (error) {
      setIsLoader(false);
      showAlert(error);
    }
  };

  const userLogout = () => {
    Alert.alert(
      'Are you sure you want to logout?',
      '',
      [
        {
          text: 'Yes',
          onPress: () => {
            navigation.navigate('Auth');
            AuthService.logout();
          },
        },
        {
          text: 'Cancel',
        },
      ],
      { cancelable: false },
    );
  };

  const updateLogin = curLogin => setLogin(curLogin);

  const updateName = curName => setName(curName);

  return (
    <KeyboardAvoidingView style={styles.container}>
      {isLoader
        && <Indicator size={40} color="blue" />}
      <ImgPicker
        name={user.full_name}
        photo={user.avatar}
        pickPhoto={pickPhoto}
      />
      <View style={styles.inputWrap}>
        <View>
          <TextInput
            style={styles.input}
            ref={input}
            autoCapitalize="none"
            placeholder="Change name ..."
            placeholderTextColor="grey"
            onChangeText={updateName}
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
            ref={input}
            autoCapitalize="none"
            placeholder="Change login ..."
            placeholderTextColor="grey"
            onChangeText={updateLogin}
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
        <TouchableOpacity onPress={userLogout}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonLabel}>logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
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
    justifyContent: 'center',
  },
  buttonLabelSave: {
    color: '#00e3cf',
    fontSize: 20,
    fontWeight: '700',
  },
  inputWrap: {
    marginVertical: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    color: 'black',
    width: 200,
    marginVertical: 15,
    padding: 7,
    paddingTop: 15,
    fontSize: 17,
  },
  subtitleInpu: {
    color: 'grey',
  },
  subtitleWrap: {
    position: 'absolute',
    marginVertical: -7,
    bottom: 0,
  },
});
