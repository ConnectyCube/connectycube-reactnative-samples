import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function DialogTitles({ name, message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.message} numberOfLines={1}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		paddingVertical: 10
	},
	name: {
		height: 30,
		lineHeight: 30,
		fontSize: 18,
		fontWeight: '700'
	},
	message: {
		height: 15,
		lineHeight: 15,
		fontSize: 15,
		fontWeight: '400'
	}
})