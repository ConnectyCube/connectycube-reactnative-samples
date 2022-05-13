import React, { useState } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { showAlert } from '../../helpers/alert'
import AuthService from '../../services/auth-service'
import Indicator from '../components/indicator'
import ChatService from '../../services/chat-service'

export default function AuthForm ({isLogin}) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoader, setIsLoader] = useState(false);

	const onSubmit = () => {
		const dataUser = { full_name: name, login: name, password: password }

		Keyboard.dismiss()

		if (!name.trim() || !password.trim()) {
			const endMessage = isLogin ? 'login.' : 'sign up'
			showAlert(`Warning.\n\nFill the fields to ${endMessage}`)
			return
		}

		setIsLoader(true)

		if (isLogin) {
			AuthService.signIn(dataUser)
				.then(() => {
		
				})
				.catch(error => {
					setIsLoader(false)
					showAlert(`Error.\n\n${JSON.stringify(error)}`)
				})
		} else {
			AuthService.signUp(dataUser)
				.then(() => {
				
					showAlert('Account successfully registered')
				})
				.catch(error => {
					setIsLoader(false)
					showAlert(`Error.\n\n${JSON.stringify(error)}`)
				}
			)}
	}

  return (
    <View style={styles.container}>
      {
        isLoader &&
        (
          <Indicator color={'green'} size={40} />
        )
      }
      <TextInput
        placeholder="Login"
        placeholderTextColor="grey"
        returnKeyType="next"
        onChangeText={setName}
        value={name}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="grey"
        secureTextEntry={true}
        autoCapitalize="none"
        returnKeyType="done"
        onChangeText={setPassword}
        value={password}
        style={styles.input}
      />
      <TouchableOpacity onPress={onSubmit}>
        <View style={styles.buttonContainer}>
          <Text style={styles.buttonLabel}>{isLogin ? 'Log in' : 'Sign up'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	input: {
		height: 50,
		color: 'black',
		borderRadius: 25,
		marginVertical: 5,
		marginHorizontal: 20,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: '#eee',
		fontSize: 18,
	},
	buttonContainer: {
		height: 50,
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
})
