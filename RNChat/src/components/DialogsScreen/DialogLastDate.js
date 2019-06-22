import React from 'react'
import { Text, StyleSheet } from 'react-native'

export default function DialogLastDate({ lastDate, lastMessage, updatedDate }) {
  function getTime() {
    const monthes = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const msgLastDate = lastMessage ? new Date(lastDate * 1000) : new Date(updatedDate)
    const msgYear = msgLastDate.getFullYear()
    const msgMonth = msgLastDate.getMonth()
    const msgDate = msgLastDate.getDate()
    const msgDay = msgLastDate.getDay()
    const msgHours = msgLastDate.getHours()
    const msgMinutes = msgLastDate.getMinutes()
    const LastDate = new Date()
    const curYear = LastDate.getFullYear()
    const curMonth = LastDate.getMonth()
    const curDate = LastDate.getDate()
    const curDay = LastDate.getDay()
  
    if (curYear > msgYear) {
      return `${monthes[msgMonth]} ${msgDate}, ${msgYear}`
    } else if (curMonth > msgMonth) {
      return `${monthes[msgMonth]} ${msgDate}`
    } else if (curDate > (msgDate + 6)) {
      return `${monthes[msgMonth]} ${msgDate}`
    } else if (curDay > msgDay) {
      return `${days[msgDay]}`
    } else {
      return `${(msgHours>9)?msgHours:('0'+msgHours)}:${(msgMinutes>9)?msgMinutes:('0'+msgMinutes)}`
    }
  }

	return <Text style={styles.time} numberOfLines={1}>{getTime()}</Text>
}

const styles = StyleSheet.create({
	time: {
		color: 'grey',
		lineHeight: 25,
		fontSize: 12,
		fontWeight: '500'
	}
})