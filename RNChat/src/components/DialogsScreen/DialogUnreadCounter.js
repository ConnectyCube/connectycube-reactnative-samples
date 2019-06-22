import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function DialogUnreadCounter({ unreadMessagesCount }) {
  return (
    unreadMessagesCount > 0 &&
    <View style={styles.container}>
      <Text style={styles.counter}>{unreadMessagesCount < 100 ? unreadMessagesCount : 99}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
	container: {
		width: 25,
		height: 25,
		lineHeight: 25,
    borderRadius: 25,
    justifyContent: 'center',
		alignItems: 'center',
    backgroundColor: 'forestgreen'
  },
  counter: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700'
  }
})