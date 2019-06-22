import React, { Component } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import Prompt from 'rn-prompt'
import { toggleAuth, toggleModal } from '../../actions/auth'
import User from '../../services/UserService';

class AuthLinks extends Component {
	resetPassword(email) {
		this.props.toggleModalState()

		User.createSession()
			.then(() => User.resetPassword(email))
			.then(() => alert('Reset password.\n\nThe email was sent'))
			.catch(e => alert(`Error to reset password.\n\n${JSON.stringify(e)}`))
	}

	render() {
		const { isLogin, isModal, toggleAuthState, toggleModalState } = this.props
		const authText = isLogin ? "Don't have an account?" : 'Already have an account?'
		const authLink = isLogin ? 'Sign up' : 'Sign in'
		const contentPosition = { justifyContent: isLogin ? 'space-between' : 'flex-end' }
	
		return (
			<View style={[styles.container, contentPosition]}>
				<Prompt
            title="Enter the email you used to register for the ConnectyCube to reset your password"
            placeholder="Email"
            visible={isModal}
            onCancel={() => toggleModalState()}
            onSubmit={email => this.resetPassword(email)}/>
				{isLogin && (
					<TouchableOpacity onPress={() => toggleModalState()}>
						<Text style={[styles.text, { marginBottom: 40 }]}>Forgot your password?</Text>
					</TouchableOpacity>
				)}
				<View style={styles.switchAuthContainer}>
					<Text style={styles.text}>{authText} </Text>
					<TouchableOpacity onPress={() => toggleAuthState()}>
						<Text style={[styles.switchAuth, styles.text]}>{authLink}</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	}
}

const mapStateToProps = (state) => ({
	isLogin: state.auth.isLogin,
	isModal: state.auth.isModal,
})

const mapDispatchToProps = (dispatch) => ({
	toggleAuthState: () => dispatch(toggleAuth()),
	toggleModalState: () => dispatch(toggleModal())
})

export default connect(mapStateToProps, mapDispatchToProps)(AuthLinks)

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingBottom: 25,
	},
	text: {
		fontSize: 16,
	},
	switchAuthContainer: {
		marginVertical: 5,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	switchAuth: {
		fontWeight: '700',
	},
})
