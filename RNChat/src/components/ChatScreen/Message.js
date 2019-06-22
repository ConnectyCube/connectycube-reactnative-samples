import React, { Component } from 'react'
import { StyleSheet, View, Text, Dimensions } from 'react-native'
import UserIcon from '../Helpers/ProfileIcon'

const fullWidth = Dimensions.get('window').width

export default class Message extends Component {
  getTime(dateSent) {
    const date = dateSent ? new Date(dateSent * 1000) : new Date()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    return `${(hours>9)?hours:('0'+hours)}:${(minutes>9)?minutes:('0'+minutes)}`
  }

	render() {
    const { message, otherSender } = this.props

		return (
      <View style={[styles.container, (otherSender ? styles.positionToLeft : styles.positionToRight)]}>
        { otherSender &&
          <UserIcon
            photo={message.sender.avatar}
            name={message.sender.full_name}
            iconSize="small"
          />
        }
        <View style={[styles.message, (otherSender ? styles.messageToLeft : styles.messageToRight)]}>
          <Text style={[styles.messageText, (otherSender ? styles.selfToLeft : styles.selfToRight)]}>
            {message.body || ' '}
          </Text>
          <Text style={styles.dateSent}>
            {this.getTime(message.date_sent)}
          </Text>
        </View>
      </View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  positionToLeft: {
    justifyContent: 'flex-start'
  },
  positionToRight: {
    justifyContent: 'flex-end'
  },
  message: {
    paddingTop: 5,
    paddingBottom: 3,
    paddingHorizontal: 6,
    borderRadius: 10
  },
  messageToLeft: {
    maxWidth: fullWidth - 90,
    borderBottomLeftRadius: 2,
    backgroundColor: 'mediumblue'
  },
  messageToRight: {
    maxWidth: fullWidth - 55,
    borderBottomRightRadius: 2,
    backgroundColor: 'blue'
  },
  messageText: {
    fontSize: 16,
    color: 'white'
  },
  selfToLeft: {
    alignSelf: 'flex-start'
  },
  selfToRight: {
    alignSelf: 'flex-end'
  },
  dateSent: {
    alignSelf: 'flex-end',
    paddingTop: 1,
    fontSize: 12,
    color: 'lightcyan'
  }
})
