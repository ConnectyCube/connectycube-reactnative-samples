import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthLinks({ toggleAuthState, isLogin }) {
	const { bottom } = useSafeAreaInsets();
	const authText = isLogin ? "Don't have an account?" : 'Already have an account?';
	const authLink = isLogin ? 'Sign up' : 'Sign in';
	const contentPosition = { justifyContent: isLogin ? 'space-between' : 'flex-end' };

	return (
		<View style={[styles.container(bottom), contentPosition]}>
			<View style={styles.switchAuthContainer}>
				<Text style={styles.text}>{authText} </Text>
				<TouchableOpacity onPress={toggleAuthState}>
					<Text style={[styles.switchAuth, styles.text]}>{authLink}</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: (bottom = 0) => ({
		alignItems: 'center',
		marginTop: 10,
		paddingBottom: 20 + bottom,
	}),
	text: {
		fontSize: 16,
		color: 'grey',
	},
	switchAuthContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	switchAuth: {
		fontWeight: '700',
	},
});
