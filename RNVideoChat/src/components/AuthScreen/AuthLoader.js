import React from 'react'
import { connect } from 'react-redux'
import { ActivityIndicator, View, StyleSheet } from 'react-native'

export class AuthLoader extends React.Component {
	render() {
		return (
			<View style={styles.container}>
				{ this.props.userIsLogging &&
					<ActivityIndicator size="large" color="blue" />
				}
			</View>
		)
	}
}

function mapStateToProps(state) {
	return {
		userIsLogging: state.user.userIsLogging
	}
}

export default connect(mapStateToProps, null)(AuthLoader)

const styles = StyleSheet.create({
  container: {
		height: 100,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white'
  }
});
