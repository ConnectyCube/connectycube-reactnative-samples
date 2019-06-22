import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native'
import { connect } from 'react-redux'
import ProfileIcon from '../Helpers/ProfileIcon'
import { pushUserId, pullUserId } from '../../actions/usersSelect'
import Icon from 'react-native-vector-icons/MaterialIcons'

class User extends Component {
	get isSelectedUser() {
		const { usersSelect, user } = this.props

		return usersSelect.indexOf(user.id) !== -1
	}

	toggleUserSelect() {
		const { pushUserId, pullUserId, user } = this.props

		if (this.isSelectedUser) {
			pullUserId(user.id)
		} else {
			pushUserId(user.id)
		}
	}

	render() {
		const { user } = this.props
		
		return (
			<TouchableOpacity onPress={() => this.toggleUserSelect()}>
				<View style={styles.container}>
					<View style={styles.userContainer}>
						<ProfileIcon
							photo={user.avatar}
							name={user.full_name}
							iconSize="medium"
							/>
						<Text style={styles.nameTitle}>{user.full_name}</Text>
					</View>
					{	
						this.isSelectedUser
						? <Icon name="radio-button-checked" size={24} color="black"/>
						: <Icon name="radio-button-unchecked" size={24} color="black"/>
					}
					</View>
			</TouchableOpacity>
		)
	}
}

const mapStateToProps = (state) => ({
	usersSelect: state.usersSelect
})

const mapDispatchToProps = (dispatch) => ({
	pushUserId: id => dispatch(pushUserId(id)),
	pullUserId: id => dispatch(pullUserId(id))
})

export default connect(mapStateToProps, mapDispatchToProps)(User)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 10,
		borderBottomWidth: 0.5,
		borderBottomColor: 'lightgrey'
	},
	userContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	nameTitle: {
		fontSize: 18,
		fontWeight: '700'
	},
	select: {
		color: 'green',
		fontSize: 10,
		fontWeight: '500'
	}
})