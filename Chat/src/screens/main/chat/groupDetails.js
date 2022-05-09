import React, { Component } from 'react'
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  FlatList,
  Alert
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import ImgPicker from '../../components/imgPicker'
import CreateBtn from '../../components/createBtn'
import { BTN_TYPE } from '../../../helpers/constants'
import UsersService from '../../../services/users-service'
import ChatService from '../../../services/chat-service'
import Avatar from '../../components/avatar'
import { SIZE_SCREEN } from '../../../helpers/constants'
import Indicator from '../../components/indicator'
import { showAlert } from '../../../helpers/alert'
import { popToTop } from '../../../routing/init'

export default class GroupDetails extends Component {

  constructor(props) {
    super(props)
    const dialog = this.props.navigation.getParam('dialog', false)
    const isNeedFetchUsers = this.props.navigation.getParam('isNeedFetchUsers', false)
    this.state = {
      isPickImage: null,
      dialogName: dialog.name,
      dialogPhoto: dialog.photo,
      isLoader: false,
      occupantsInfo: isNeedFetchUsers ? [] : UsersService.getUsersInfoFromRedux(dialog.occupants_ids)
    }
  }

  componentDidMount() {
    const dialog = this.props.navigation.getParam('dialog', false)
    const isNeedFetchUsers = this.props.navigation.getParam('isNeedFetchUsers', false)
    if (isNeedFetchUsers) {
      this.fetchMoreUsers(dialog.occupants_ids)
    }
  }

  fetchMoreUsers = async (occupants_ids) => {
    await UsersService.getOccupants(occupants_ids)
    const users = UsersService.getUsersInfoFromRedux(occupants_ids)
    this.setState({ occupantsInfo: users })
  }

  pickPhoto = (image) => {
    this.setState({ isPickImage: image })
  }

  updateDialog = () => {
    const dialog = this.props.navigation.getParam('dialog', false)
    const { dialogName, isPickImage } = this.state
    const updateInfo = {}
    if (dialogName !== dialog.name) {
      updateInfo.name = dialogName
    }
    if (isPickImage) {
      updateInfo.img = isPickImage
    }
    if (Object.keys(updateInfo).length === 0) {
      return false
    }
    updateInfo.dialogId = dialog.id
    this.setState({ isLoader: true })
    ChatService.updateDialogInfo(updateInfo)
      .then(() => {
        this.setState({ isLoader: false })
        showAlert('Dialog info is updated successfully')
      })
      .catch((error) => {
        this.setState({ isLoader: false })
        showAlert(error)
      })
  }

  leaveGroup = () => {
    const { navigation } = this.props
    const dialog = navigation.getParam('dialog', false)
    Alert.alert(
      'Are you sure you want to leave the group chat?',
      '',
      [
        {
          text: 'Yes',
          onPress: () => {
            this.setState({ isLoader: true })
            ChatService.deleteDialog(dialog.id)
              .then(() => {
                this.setState({ isLoader: false })
                this.props.navigation.dispatch(popToTop)
              })
              .catch((error) => {
                this.setState({ isLoader: false })
                this.props.navigation.dispatch(popToTop)
              })
          }
        },
        {
          text: 'Cancel'
        }
      ],
      { cancelable: false }
    )
  }

  isGroupCreator = () => {
    const dialog = this.props.navigation.getParam('dialog', false)
    return ChatService.isGroupCreator(dialog.user_id)
  }

  goToContactDeteailsScreen = (dialog) => {
    const { navigation } = this.props
    navigation.push('ContactDetails', { dialog })
  }

  goToContactsScreen = () => {
    if (this.state.occupantsInfo.length === 8) {
      showAlert('Maximum 9 participants')
      return
    }
    const { navigation } = this.props
    const dialog = navigation.getParam('dialog', false)
    navigation.push('Contacts', { isGroupDetails: true, dialog, addParticipant: this.addParticipant })
  }

  addParticipant = (participants) => {
    const dialog = this.props.navigation.getParam('dialog', false)
    this.setState({ isLoader: true })
    ChatService.addOccupantsToDialog(dialog.id, participants)
      .then(dialog => {
        const updateArrUsers = UsersService.getUsersInfoFromRedux(dialog.occupants_ids)
        showAlert('Participants added')
        this.setState({ isLoader: false, occupantsInfo: updateArrUsers })
      })
      .catch(error => {
        console.warn('addParticipant', error)
        this.setState({ isLoader: false })
      })
  }

  updateName = dialogName => this.setState({ dialogName })

  keyExtractor = (item, index) => index.toString()

  _renderUser = ({ item }) => {
    return (
      <TouchableOpacity style={styles.renderContainer} onPress={() => this.goToContactDeteailsScreen(item)}>
        <View style={styles.renderAvatar}>
          <Avatar
            photo={item.avatar}
            name={item.full_name}
            iconSize="medium"
          />
          <Text style={styles.nameTitle}>{item.full_name}</Text>
        </View>
        <View>
          <Icon name="keyboard-arrow-right" size={30} color='#48A6E3' />
        </View>
      </TouchableOpacity>
    )
  }

  _renderFlatListHeader = () => {
    return this.isGroupCreator() ?
      (
        <TouchableOpacity style={styles.renderHeaderContainer} onPress={this.goToContactsScreen}>
          <View style={styles.renderAvatar}>
            <Icon name="person-add" size={35} color='#48A6E3' style={{ marginRight: 15 }} />
          </View>
          <View>
            <Text style={styles.nameTitle}>Add member</Text>
          </View>
        </TouchableOpacity>
      ) : false
  }

  _renderFlatListFooter = () => {
    return <TouchableOpacity style={styles.renderHeaderContainer} onPress={this.leaveGroup}>
      <View style={styles.renderAvatar}>
        <Icon name="exit-to-app" size={35} color='#48A6E3' style={{ marginRight: 15 }} />
      </View>
      <View>
        <Text style={styles.nameTitle}>Exit group</Text>
      </View>
    </TouchableOpacity>
  }

  render() {
    const { dialogName, dialogPhoto, isLoader, occupantsInfo } = this.state
    return (
      <KeyboardAvoidingView style={styles.container}>
        {isLoader &&
          <Indicator color={'blue'} size={40} />
        }
        <ImgPicker name={dialogName} photo={dialogPhoto} onPickPhoto={this.pickPhoto} disabled={!this.isGroupCreator()} />
        {this.isGroupCreator() ?
          (<View>
            <TextInput
              style={styles.input}
              ref="input"
              autoCapitalize="none"
              placeholder="Change group name ..."
              placeholderTextColor="grey"
              onChangeText={this.updateName}
              value={dialogName}
              maxLength={100}
            />
            <View style={styles.subtitleWrap}>
              <Text style={styles.subtitleInpu}>Change group name</Text>
            </View>
          </View>) :
          <Text style={styles.dialogName}>{dialogName}</Text>
        }
        <SafeAreaView style={styles.listUsers}>
          <FlatList
            data={occupantsInfo}
            ListHeaderComponent={this._renderFlatListHeader}
            ListFooterComponent={this._renderFlatListFooter}
            renderItem={this._renderUser}
            keyExtractor={this.keyExtractor}
          />
        </SafeAreaView>
        {this.isGroupCreator() &&
          <CreateBtn goToScreen={this.updateDialog} type={BTN_TYPE.CREATE_GROUP} />
        }
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40
  },
  picker: {
    width: 102,
    height: 102,
    borderWidth: 1,
    borderColor: 'red'
  },
  imgPicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  icon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: 5,
    backgroundColor: 'white',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#48A6E3'
  },
  input: {
    borderBottomWidth: 1,
    borderColor: 'grey',
    color: 'black',
    width: 200,
    marginVertical: 15,
    padding: 7,
    paddingTop: 15,
    fontSize: 17
  },
  subtitleInpu: {
    color: 'grey'
  },
  subtitleWrap: {
    position: 'absolute',
    marginVertical: -7,
    bottom: 0,
  },
  listUsers: {
    marginVertical: 35,
    flex: 1
  },
  renderContainer: {
    width: SIZE_SCREEN.width - 30,
    borderBottomWidth: 0.5,
    borderColor: 'grey',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7
  },
  renderHeaderContainer: {
    width: SIZE_SCREEN.width - 30,
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: 'grey',
    alignItems: 'center',
    paddingVertical: 7
  },
  renderAvatar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameTitle: {
    fontSize: 17
  },
  dialogName: {
    fontSize: 17,
    marginTop: 35
  }
})
