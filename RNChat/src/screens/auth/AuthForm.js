import React, { useCallback, useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { showAlert } from '../../helpers/alert';
import { AuthService } from '../../services';
import Indicator from '../components/indicator';

export default function AuthForm({ isLogin }) {
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');
	const [isLoader, setIsLoader] = useState(false);

	const onSubmit = useCallback(() => {
		const dataUser = { full_name: name, login: name, password: password };

		Keyboard.dismiss();

		if (!name.trim() || !password.trim()) {
			showAlert(`Warning.\n\nFill the fields to ${isLogin ? 'login' : 'sign up'}`);
			return;
		}

		setIsLoader(true);

		if (isLogin) {
			AuthService.signIn(dataUser)
				.catch(error => {
					setIsLoader(false);
					showAlert(`Error.\n\n${JSON.stringify(error)}`);
				});
		} else {
			AuthService.signUp(dataUser)
				.then(() => {
					showAlert('Account successfully registered');
				})
				.catch(error => {
					setIsLoader(false);
					showAlert(`Error.\n\n${JSON.stringify(error)}`);
				});
		}
	}, [name, password, isLogin]);

	return (
		<View style={styles.container}>
			<Indicator isActive={isLoader} />
			<TextInput
				placeholder="Login"
				placeholderTextColor="grey"
				textContentType="username"
				autoCapitalize="none"
				returnKeyType="next"
				autoComplete="off"
				onChangeText={setName}
				value={name}
				style={styles.input}
				blurOnSubmit
			/>
			<TextInput
				secureTextEntry
				placeholder="Password"
				placeholderTextColor="grey"
				textContentType="password"
				autoCapitalize="none"
				returnKeyType="done"
				onChangeText={setPassword}
				value={password}
				style={styles.input}
				blurOnSubmit
			/>
			<TouchableOpacity onPress={onSubmit}>
				<View style={styles.buttonContainer}>
					<Text style={styles.buttonLabel}>{isLogin ? 'Log in' : 'Sign up'}</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingTop: 20,
	},
	input: {
		height: 50,
		color: 'black',
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
		justifyContent: 'center',
	},
	buttonLabel: {
		color: '#ffffff',
		fontSize: 20,
		fontWeight: '700',
	},
});
