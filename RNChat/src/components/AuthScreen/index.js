import React, { Component } from 'react'
import { KeyboardAvoidingView, StatusBar, Platform } from 'react-native'
import SoftInputMode from 'react-native-set-soft-input-mode';
import { connect } from 'react-redux'
import AuthLogo from './AuthLogo'
import AuthForm from './AuthForm'
import AuthLinks from './AuthLinks'

class Auth extends Component {
	componentDidMount() {
		if (Platform.OS === 'android') {
			SoftInputMode.set(SoftInputMode.ADJUST_RESIZE);
		}
	}

	render() {
		return (
			<KeyboardAvoidingView
				style={{ flex: 1, backgroundColor: 'white' }}
				behavior={Platform.OS === 'ios' ? "padding" : null}
        keyboardVerticalOffset={0}>
				<StatusBar backgroundColor="white" barStyle="dark-content"/>
				<AuthLogo />
				<AuthForm />
				<AuthLinks />
			</KeyboardAvoidingView>
		)
	}
}

const mapStateToProps = (state) => ({
	isLogin: state.auth.isLogin
})

export default connect(mapStateToProps)(Auth)
