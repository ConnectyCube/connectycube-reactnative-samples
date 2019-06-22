import React, { Component } from 'react'
import { StyleSheet, View, TextInput, Platform } from 'react-native'
import { usersFound, usersNotFound, usersSearchWarn, usersSearchInProgress } from '../../actions/usersSearch'
import UserService from '../../services/UserService'
import { connect } from 'react-redux'
import { getStatusBarHeight } from 'react-native-status-bar-height'

class SearchUsers extends Component {
  state = { keyword: '' }

  updateSearch = keyword => this.setState({ keyword })

  searchUsers = () => {
    const { keyword } = this.state
    const {
      usersFound,
      usersNotFound,
      usersSearchWarn,
      usersSearchInProgress
    } = this.props

    if (keyword.length > 2) {
      usersSearchInProgress()
      
      UserService.listUsersByFullName(keyword)
        .then(users => {
          users.length
            ? usersFound(users)
            : usersNotFound()
        }).catch(() => {
          usersNotFound()
        })
    } else {
      usersSearchWarn()
    }
  }

	render() {
    return (
      <View style={styles.container}>
        <TextInput style={styles.searchInput}
          autoCapitalize="none"
          placeholder="Search users..."
          returnKeyType="search"
          onChangeText={this.updateSearch}
          onSubmitEditing={this.searchUsers}
          value={this.state.search}
        />
      </View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
    backgroundColor: 'blue',
    paddingTop: Platform.OS === 'ios' ? getStatusBarHeight() : 8,
    paddingBottom: Platform.OS === 'ios' ? 4 : 8,
    paddingHorizontal: 12
	},
	searchInput: {
    height: 40,
		fontSize: 18,
    borderRadius: 20,
    fontWeight: '300',
    paddingHorizontal: 10,
    backgroundColor: 'whitesmoke'
	}
})

const mapDispatchToProps = (dispatch) => ({
  usersFound: users => dispatch(usersFound(users)),
  usersNotFound: () => dispatch(usersNotFound()),
  usersSearchWarn: () => dispatch(usersSearchWarn()),
  usersSearchInProgress: () => dispatch(usersSearchInProgress())
})

export default connect(null, mapDispatchToProps)(SearchUsers)