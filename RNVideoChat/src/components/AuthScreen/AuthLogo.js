import React from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'

export default class AuthLogo extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				<Image style={styles.imageSize} source={require('../../images/logo_with_text.png')} />
				<Text>Video Chat</Text>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	imageSize: {
		width: 200,
		height: 150,
	}
})
