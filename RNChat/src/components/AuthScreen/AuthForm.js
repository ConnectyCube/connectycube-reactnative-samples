import React, { Component } from 'react'
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import { userLogin } from '../../actions/user'
import User from '../../services/UserService'

class AuthForm extends Component {
	state = {
		name: '',
		email: '',
		password: '',
	}

	login() {
		if (this.props.isLogin) {
			this._signIn()
		} else {
			this._signUp()
		}
	}

	_signIn() {
		const { name, email } = this.state

		if (!name.trim() && !email.trim()) {
			alert('Warning.\n\nFill the fields to login.')
			return
		}

		User.signin(this.state)
			.then(this.props.userLogin)
			.catch(e => alert(`Error.\n\n${JSON.stringify(e)}`))
	}

	_signUp() {
		const { name, email, password } = this.state

		if (!name.trim() || !email.trim() || !password.trim()) {
			alert('Warning.\n\nFill the fields to sign up')
			return
		}

		User.signup({
			full_name: name,
			email: email,
			password: password
		})
			.then(this.props.userLogin)
			.catch(e => alert(`Error.\n\n${JSON.stringify(e)}`))
	}

	componentWillUnmount() {
		this.setState({
			name: '',
			email: '',
			password: '',
		})
	}
	
	render() {
		return (
			<View style={styles.container}>
				{!this.props.isLogin && (
					<TextInput
						placeholder="Name"
						returnKeyType="next"
						onSubmitEditing={() => this.emailInput.focus()}
						ref={input => (this.nameInput = input)}
						onChangeText={text => this.setState({ name: text })}
						style={styles.input}
					/>
				)}
				<TextInput
					placeholder="Email"
					keyboardType="email-address"
					autoCapitalize="none"
					returnKeyType="next"
					ref={input => (this.emailInput = input)}
					onSubmitEditing={() => this.passwordInput.focus()}
					onChangeText={text => this.setState({ email: text })}
					style={styles.input}
				/>
				<TextInput
					placeholder="Password"
					secureTextEntry={true}
					autoCapitalize="none"
					returnKeyType="done"
					ref={input => (this.passwordInput = input)}
					onChangeText={text => this.setState({ password: text })}
					style={styles.input}
				/>
				<TouchableOpacity onPress={() => this.login()}>
					<View style={styles.buttonContainer}>
						<Text style={styles.buttonLabel}>{this.props.isLogin ? 'Log in' : 'Sign up'}</Text>
					</View>
				</TouchableOpacity>
			</View>
		)
	}
}

const mapStateToProps = (state) => ({
	isLogin: state.auth.isLogin,
	user: state.user
})

const mapDispatchToProps = (dispatch) => ({
	userLogin: user => dispatch(userLogin(user))
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthForm)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	input: {
		height: 50,
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
