import React from 'react'
import { Image, View, Text, StyleSheet } from 'react-native'

export default function ProfileIcon({ photo, name, iconSize }) {
  const styles = iconSize === 'large' ? largeIcon : (iconSize === 'medium' ? mediumIcon : smallIcon)

  function randomizeColor() {
		const colors = [
			'blue',
			'darkmagenta',
			'fuchsia',
			'gold',
			'green',
			'limegreen',
			'navy',
			'purple',
			'red',
			'skyblue'
		]

		return colors[name.length % colors.length]
	}
	
	function getIconLabel() {
		const words = name.split(' ')

		return (
			words.length > 1
				? label = `${words[0].slice(0, 1)}${words[1].slice(0, 1)}`
				: name.slice(0, 2)
		)
	}
  
  return (
    photo
      ? <Image style={styles.photo} source={photo}/>
      : <View style={[styles.photo, styles.randomPhoto, {backgroundColor: randomizeColor()}]}>
          <Text style={styles.randomIcon}>{getIconLabel()}</Text>
        </View>
  )
}

const largeIcon = StyleSheet.create({
	photo: {
		borderRadius: 25,
		height: 50,
		width: 50,
		marginVertical: 10,
		marginRight: 10
	},
	randomPhoto: {
		borderWidth: 0.5,
		borderColor: 'lightgrey',
		justifyContent: 'center',
		alignItems: 'center'
	},
	randomIcon: {
		fontSize: 25,
		fontWeight: '700',
		color: 'white'
	}
})

const mediumIcon = StyleSheet.create({
	photo: {
		borderRadius: 20,
		height: 40,
		width: 40,
		marginVertical: 10,
		marginRight: 10
	},
	randomPhoto: {
		borderWidth: 0.5,
		borderColor: 'lightgrey',
		justifyContent: 'center',
		alignItems: 'center'
	},
	randomIcon: {
		fontSize: 20,
		fontWeight: '600',
		color: 'white'
	}
})

const smallIcon = StyleSheet.create({
	photo: {
		borderRadius: 15,
		height: 30,
		width: 30,
		marginRight: 5
	},
	randomPhoto: {
		borderWidth: 0.5,
		borderColor: 'lightgrey',
		justifyContent: 'center',
		alignItems: 'center'
	},
	randomIcon: {
		fontSize: 18,
		fontWeight: '600',
		color: 'white'
	}
})