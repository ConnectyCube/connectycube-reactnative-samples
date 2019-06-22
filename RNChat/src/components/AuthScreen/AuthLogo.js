import React from 'react'
import { StyleSheet, View, Image } from 'react-native'
import { connect } from 'react-redux'

const AuthLogo = ({ isLogin }) => {
	const flexibleMargin = { marginBottom: isLogin ? 10 : 40 }

	return (
		<View style={styles.container}>
			<Image style={[styles.imageSize, flexibleMargin]} source={require('../../images/logo_with_text.png')} />
		</View>
	)
}

const mapStateToProps = (state) => ({
	isLogin: state.auth.isLogin
})

export default connect(mapStateToProps)(AuthLogo)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	imageSize: {
		width: 200,
		height: 150,
	},
})
