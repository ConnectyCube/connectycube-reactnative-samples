import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

const AuthLogo = () => {
	return (
		<View style={styles.container}>
			<Image style={styles.imageSize} source={require('../../../assets/image/splash.png')} resizeMode="contain" />
		</View>
	);
};

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
});

export default AuthLogo;
