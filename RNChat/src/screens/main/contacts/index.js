import React, { PureComponent } from 'react'
import { StyleSheet, View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialIcons'
import IconGroup from 'react-native-vector-icons/FontAwesome'
import UsersService from '../../../services/users-service'
import Indicator from '../../components/indicator'
import User from './renderUser'
import Avatar from '../../components/avatar'
import { showAlert } from '../../../helpers/alert'
import CreateBtn from '../../components/createBtn'
import { BTN_TYPE } from '../../../helpers/constants'
import ChatService from '../../../services/chat-service'
import { popToTop } from '../../../routing/init'

class Contacts extends PureComponent {
  isGroupDetails = false

  constructor(props) {
    super(props)
    this.isGroupDetails = this.props.navigation.getParam('isGroupDetails', false)

    this.state = {
      keyword: '',
      isLoader: false,
      isUpdate: false,
      dialogType: this.isGroupDetails
    }
  }

  listUsers = null

  selectedUsers = []

  userNotFound = false


  updateSearch = keyword => this.setState({ keyword })

  keyExtractor = (item, index) => index.toString()

  toggleUserSelect = (user) => {
    let newArr = []
    this.selectedUsers.forEach(elem => {
      if (elem.id !== user.id) {
        newArr.push(elem)
      }
    })
    this.selectedUsers = newArr
    this.setState({ isUpdate: !this.state.isUpdate })
  }

  _renderUser = ({ item }) => {
    const isSelected = this.selectedUsers.find(elem => elem.id === item.id)
    return (
      <User
        user={item}
        selectUsers={this.selectUsers}
        dialogType={this.state.dialogType}
        selectedUsers={isSelected ? true : false}
      />
    )
  }

  changeTypeDialog = () => {
    this.selectedUsers = []
    this.setState({ dialogType: !this.state.dialogType })
  }

  _renderSelectedUser = ({ item }) => {
    return (
      <TouchableOpacity style={styles.selectedUser} onPress={() => this.toggleUserSelect(item)}>
        <View style={{ paddingLeft: 10 }}>
          <Avatar
            photo={item.avatar}
            name={item.full_name}
            iconSize="medium"
          />
          <View style={{ position: 'absolute', bottom: 7, right: 7, backgroundColor: 'white', width: 20, height: 20, borderRadius: 10 }}>
            <Icon name="cancel" size={20} color='grey' />
          </View>
        </View>
        <Text numberOfLines={2} style={{ textAlign: 'center' }}>{item.full_name}</Text>
      </TouchableOpacity >
    )
  }

  selectUsers = (user) => {
    const dialog = this.props.navigation.getParam('dialog', false)
    const str = dialog ? dialog.occupants_ids.length : 1
    // False - Private dialog 
    if (!this.state.dialogType) {
      return ChatService.createPrivateDialog(user.id)
        .then((newDialog) => {
          this.props.navigation.dispatch(popToTop)
          this.props.navigation.push('Chat', { dialog: newDialog })
        })
    }

    // True - Publick dialog 
    const userSelect = this.selectedUsers.find(elem => elem.id === user.id)
    if (userSelect) {
      let newArr = []
      this.selectedUsers.forEach(elem => {
        if (elem.id !== user.id) {
          newArr.push(elem)
        }
      })
      this.selectedUsers = newArr
    } else {
      if (this.selectedUsers.length + str === 9) {
        showAlert('Maximum 9 participants')
        return
      }
      this.selectedUsers.push(user)
    }
    this.setState({ isUpdate: !this.state.isUpdate })
  }

  searchUsers = () => {
    const dialog = this.props.navigation.getParam('dialog', false)
    const { keyword } = this.state
    let str = keyword.trim()
    if (str.length > 2) {
      this.setState({ isLoader: true })
      UsersService.listUsersByFullName(str, dialog?.occupants_ids)
        .then(users => {
          this.listUsers = users
          this.userNotFound = false
          this.setState({ isLoader: false })
        })
        .catch(() => {
          this.userNotFound = true
          this.setState({ isLoader: false })
        })
    } else {
      showAlert('Enter more than 3 characters')
    }
  }

  goToCreateDialogScreen = () => {
    const { navigation } = this.props
    if (this.isGroupDetails) {
      const addParticipant = this.props.navigation.getParam('addParticipant', false)
      navigation.goBack()
      addParticipant(this.selectedUsers)
      return
    }
    navigation.push('CreateDialog', { users: this.selectedUsers })
  }

  render() {
    const { isLoader, dialogType } = this.state
    return (
      <View style={styles.container}>
        {isLoader && (
          <Indicator color={'red'} size={40} />
        )}
        <View style={styles.searchUser}>
          <TextInput style={styles.searchInput}
            autoCapitalize="none"
            placeholder="Search users..."
            placeholderTextColor="grey"
            returnKeyType="search"
            onChangeText={this.updateSearch}
            onSubmitEditing={this.searchUsers}
            value={this.state.search}
          />
        </View>
        <View style={styles.dialogTypeContainer}>
          {!this.isGroupDetails &&
            <TouchableOpacity style={styles.dialogType} onPress={this.changeTypeDialog}>
              {dialogType ? <IconGroup name="group" size={25} color='#48A6E3' /> :
                <IconGroup name="user" size={25} color='#48A6E3' />
              }
              <Text style={styles.dialogTypeText}>{dialogType ? `Create private chat` : `Create group chat`}</Text>
            </TouchableOpacity>
          }
        </View>
        <View style={this.selectedUsers.length > 0 && styles.containerCeletedUsers}>
          <FlatList
            data={this.selectedUsers}
            keyExtractor={this.keyExtractor}
            renderItem={(item) => this._renderSelectedUser(item)}
            horizontal={true}
          />
        </View>
        {this.userNotFound ?
          (<Text style={styles.userNotFound}>Couldn't find user</Text>) :
          (
            <View style={{ flex: 1 }}>
              <FlatList
                data={this.listUsers}
                keyExtractor={this.keyExtractor}
                renderItem={(item) => this._renderUser(item)}
              />
            </View>
          )
        }
        {this.selectedUsers.length > 0 && (
          <CreateBtn goToScreen={this.goToCreateDialogScreen} type={BTN_TYPE.CONTACTS} />
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchUser: {
    margin: 10
  },
  searchInput: {
    fontSize: 18,
    fontWeight: '300',
    borderWidth: 0.5,
    borderRadius: 20,
    borderColor: 'grey',
    color: 'black',
    padding: 10,
  },
  dialogTypeContainer: {
    marginHorizontal: 12,
    paddingVertical: 10
  },
  dialogType: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dialogTypeText: {
    marginHorizontal: 5,
    fontSize: 16
  },
  containerCeletedUsers: {
    borderBottomWidth: 0.5,
    borderColor: 'grey',
    margin: 10
  },
  selectedUser: {
    width: 70,
    paddingBottom: 5,
    alignItems: 'center',
  },
  userNotFound: {
    fontSize: 17,
    marginTop: 20,
    textAlign: 'center'
  }
})

const mapStateToProps = ({ dialogs }) => ({
  dialogs
})

export default connect(mapStateToProps)(Contacts)