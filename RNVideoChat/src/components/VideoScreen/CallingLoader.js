import React from 'react'
import { connect } from 'react-redux'
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native'

export class CallingLoader extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				{ this.props.userIsCalling &&
					<View style={styles.info}>
						<Text style={styles.text}>Calling...</Text>
						<ActivityIndicator size="large" color="white" />
					</View>
				}
			</View>
		)
	}
}

function mapStateToProps(state) {
	return {
		userIsCalling: state.videosession.userIsCalling
	}
}

export default connect(mapStateToProps, null)(CallingLoader)

const styles = StyleSheet.create({
	container: {
		...StyleSheet.absoluteFill,
		flex: 1,
		justifyContent: 'center'
	},
	info: {
		flexDirection: 'row',
		justifyContent: 'center'
	},
	text: {
		fontSize: 28,
		color: 'white',
		marginRight: 10
	}
})
