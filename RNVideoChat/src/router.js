import React from 'react'
import { connect } from 'react-redux'
import { StyleSheet } from 'react-native'
import { Actions, Router, Scene } from 'react-native-router-flux'
import { userLogout } from './actions/user'
import AuthScreen from './components/AuthScreen'
import VideoScreen from './components/VideoScreen'

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

class AppRouter extends React.Component {
	render() {
		return (
			<Router navigationBarStyle={styles.navBar} titleStyle={styles.navTitle}>
				<Scene key="main">

					<Scene key="auth"
						component={AuthScreen}
						drawerLockMode="locked-closed'"
						type="replace"
						hideNavBar
					/>

					<Scene key="videochat"
						component={VideoScreen}
						title="Video Chat"
						tintColor="white"
						hideNavBar
					/>

				</Scene>
			</Router>
		)
	}
}

function mapDispatchToProps(dispatch) {
	return {
		userLogout: () => dispatch(userLogout())
	}
}

export default connect(null, mapDispatchToProps)(AppRouter)
