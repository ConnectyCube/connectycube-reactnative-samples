import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'

export default function AuthLinks ({ toggleAuthState, isLogin }){
  const authText = isLogin ? "Don't have an account?" : 'Already have an account?'
  const authLink = isLogin ? 'Sign up' : 'Sign in'
  const contentPosition = { justifyContent: isLogin ? 'space-between' : 'flex-end' }

  return (
    <View style={[styles.container, contentPosition]}>
      <View style={styles.switchAuthContainer}>
        <Text style={styles.text}>{authText} </Text>
        <TouchableOpacity onPress={toggleAuthState}>
          <Text style={[styles.switchAuth, styles.text]}>{authLink}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		paddingBottom: 25,
	},
	text: {
		fontSize: 16,
    color: 'grey',
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
