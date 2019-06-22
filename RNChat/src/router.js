import React, { Component } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, Alert } from 'react-native'
import { Actions, Router, Scene } from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { chatDisconnected } from './actions/connection'
import { userLogout } from './actions/user'
import UserService from './services/UserService'
import AppLoader from './components/Helpers/Loader'
import AuthScreen from './components/AuthScreen'
import CreateDialogScreen from './components/CreateDialogScreen'
import SearchUsers from './components/CreateDialogScreen/SearchUsers'
import DialogsScreen from './components/DialogsScreen'
import ChatScreen from './components/ChatScreen'

const styles = StyleSheet.create({
	navBar: {
		backgroundColor: 'blue'
	},
	navTitle: {
		flex: 1,
		fontSize: 18,
		color: '#ffffff',
		textAlign: 'center'
	}
})

class AppRouter extends Component {
	_shouldLogout() {
		Alert.alert(
			'Log Out',
			'Do you really want to leave the chat?',
			[ 
				{ text: 'Cancel', onPress: () => {} },
				{ text: 'OK', onPress: () => this._toAuthScene() }
			]
		)
	}

	_toAuthScene() {
		const { chatDisconnected, userLogout } = this.props
			
		if (Actions.currentScene !== "auth") {
			UserService.logout()
				.then(() => {
					userLogout()
					chatDisconnected()
					Actions.auth()
				})
		}
	}

	_toCreateDialogScene() {
		if (Actions.currentScene !== "createDialog") Actions.createDialog()
	}

	render() {
		return (
			<Router navigationBarStyle={styles.navBar} titleStyle={styles.navTitle}>
				<Scene key="main">
					<Scene key="spinner"
						component={AppLoader}
						initial
						hideNavBar
					/>
					<Scene key="auth"
						component={AuthScreen}
						drawerLockMode="locked-closed'"
						type="replace"
						hideNavBar
					/>
					<Scene key="dialogs"
						component={DialogsScreen}
						title="ConnectyCube Chat"
						statusBarStyle="light-content"
						type="replace"
						onLeft={() => this._shouldLogout()}
						onRight={this._toCreateDialogScene}
						leftTitle={
							<Icon name="exit-to-app" size={26} color="white"/>
						}
						rightTitle={
							<Icon name="add-circle-outline" size={26} color="white"/>
						}
					/>
					<Scene key="chat"
						component={ChatScreen}
						title="ConnectyCube Chat"
						backButtonTintColor="white"
						tintColor="white"
						titleStyle={{textAlign: 'left'}}
					/>
					<Scene key="createDialog"
						component={CreateDialogScreen}
						navBar={SearchUsers}
					/>
				</Scene>
			</Router>
		)
	}
}

const mapDispatchToProps = (dispatch) => ({
	chatDisconnected: () => dispatch(chatDisconnected()),
	userLogout: () => dispatch(userLogout())
})

export default connect(null, mapDispatchToProps)(AppRouter)
