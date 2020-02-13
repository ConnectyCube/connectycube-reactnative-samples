import React, { Component } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { showAlert } from '../../helpers/alert'
import AuthService from '../../services/auth-service'
import Indicator from '../components/indicator'
import ChatService from '../../services/chat-service'

export default class AuthForm extends Component {
	state = {
		name: '',
		password: '',
		isLoader: false
	}

	componentDidUpdate(prevProps) {
		const { isLogin } = this.props
		if (prevProps.isLogin !== isLogin) {
			this.setState({ name: '', password: '' })
		}
	}

	login = () => {
		const { name, password } = this.state
		const { isLogin, navigation } = this.props
		const dataUser = { full_name: name, login: name, password: password }

		Keyboard.dismiss()

		if (!name.trim() || !password.trim()) {
			const endMessage = isLogin ? 'login.' : 'sign up'
			showAlert(`Warning.\n\nFill the fields to ${endMessage}`)
			return
		}

		this.setState({ isLoader: true })

		if (isLogin) {
			AuthService.signIn(dataUser)
				.then(() => {
					ChatService.setUpListeners()
					this.setState({ isLoader: false })
					navigation.navigate('Dialogs')
				})
				.catch(error => {
					this.setState({ isLoader: false })
					showAlert(`Error.\n\n${JSON.stringify(error)}`)
				})
		} else {
			AuthService.signUp(dataUser)
				.then(() => {
					this.setState({ isLoader: false })
					ChatService.setUpListeners()
					showAlert('Account successfully registered')
					navigation.navigate('Dialogs')
				})
				.catch(error => {
					this.setState({ isLoader: false })
					showAlert(`Error.\n\n${JSON.stringify(error)}`)
				}
				)
		}

	}

	render() {
		const { name, password, isLoader } = this.state
		const { isLogin } = this.props
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
					onSubmitEditing={() => this.emailInput.focus()}
					onChangeText={text => this.setState({ name: text })}
					value={name}
					style={styles.input}
				/>
				<TextInput
					placeholder="Password"
					placeholderTextColor="grey"
					secureTextEntry={true}
					autoCapitalize="none"
					returnKeyType="done"
					onChangeText={text => this.setState({ password: text })}
					value={password}
					style={styles.input}
				/>
				<TouchableOpacity onPress={() => this.login()}>
					<View style={styles.buttonContainer}>
						<Text style={styles.buttonLabel}>{isLogin ? 'Log in' : 'Sign up'}</Text>
					</View>
				</TouchableOpacity>
			</View>
		)
	}
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
