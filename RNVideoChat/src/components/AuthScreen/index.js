import React from 'react'
import { View, StatusBar } from 'react-native'
import AuthLogo from './AuthLogo'
import AuthForm from './AuthForm'
import AuthLoader from './AuthLoader'

export default class AuthScreen extends React.Component {
	render() {
		return (
			<View style={{ flex: 1, backgroundColor: 'white' }}>
				<StatusBar backgroundColor="white" barStyle="dark-content" animated/>
				<AuthLogo />
				<AuthLoader />
				<AuthForm />
			</View>
		)
	}
}
