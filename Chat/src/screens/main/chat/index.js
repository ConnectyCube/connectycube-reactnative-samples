import React, { PureComponent } from 'react'
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  Text,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  ActivityIndicator
} from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialIcons'
import AttachmentIcon from 'react-native-vector-icons/Entypo'
import { AutoGrowingTextInput } from 'react-native-autogrow-textinput'
import ChatService from '../../../services/chat-service'
import UsersService from '../../../services/users-service'
import Message from './message'
import Avatar from '../../components/avatar'
import ImagePicker from 'react-native-image-crop-picker'
import { DIALOG_TYPE } from '../../../helpers/constants'

export class Chat extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      activIndicator: true,
      messageText: ''
    }
  }

  needToGetMoreMessage = null

  static navigationOptions = ({ navigation }) => {
    let dialog = navigation.state.params.dialog
    let dialogPhoto = ''
    if (dialog.type === DIALOG_TYPE.PRIVATE) {
      dialogPhoto = UsersService.getUsersAvatar(dialog.occupants_ids)
    } else {
      dialogPhoto = dialog.photo
    }
    return {
      headerTitle: (
        <Text numberOfLines={3} style={{ fontSize: 22, color: 'black' }}>
          {navigation.state.params.dialog.name}
        </Text>
      ),
      headerRight: (
        <TouchableOpacity onPress={() => this.goToDetailsScreen(navigation)}>
          <Avatar
            photo={dialogPhoto}
            name={navigation.state.params.dialog.name}
            iconSize="small"
          />
        </TouchableOpacity>
      )
    }
  }

  static goToDetailsScreen = (props) => {
    const isNeedFetchUsers = props.getParam('isNeedFetchUsers', false)
    if (props.state.params.dialog.type === DIALOG_TYPE.PRIVATE) {
      props.push('ContactDetails', { dialog: props.state.params.dialog })
    } else {
      props.push('GroupDetails', { dialog: props.state.params.dialog, isNeedFetchUsers })
    }
  }

  componentDidMount() {
    const { dialog } = this.props.navigation.state.params
    ChatService.getMessages(dialog)
      .catch(e => alert(`Error.\n\n${JSON.stringify(e)}`))
      .then(amountMessages => {
        amountMessages === 100 ? this.needToGetMoreMessage = true : this.needToGetMoreMessage = false
        this.setState({ activIndicator: false })
      })
  }

  componentWillUnmount() {
    ChatService.resetSelectedDialogs()
  }


  getMoreMessages = () => {
    const { dialog } = this.props.navigation.state.params
    if (this.needToGetMoreMessage) {
      this.setState({ activIndicator: true })
      ChatService.getMoreMessages(dialog)
        .then(amountMessages => {
          amountMessages === 100 ? this.needToGetMoreMessage = true : this.needToGetMoreMessage = false
          this.setState({ activIndicator: false })
        })
    }
  }

  onTypeMessage = messageText => this.setState({ messageText })

  sendMessage = async () => {
    const { dialog } = this.props.navigation.state.params
    const { messageText } = this.state
    if (messageText.length <= 0) return
    await ChatService.sendMessage(dialog, messageText)
    this.setState({ messageText: '' })
  }

  sendAttachment = async () => {
    const { dialog } = this.props.navigation.state.params
    const img = await this.onPickImage()
    ChatService.sendMessage(dialog, '', img)
  }

  onPickImage = () => {
    return ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true
    }).then(image => {
      return image
    })
  }

  _keyExtractor = (item, index) => index.toString()

  _renderMessageItem(message) {
    const { user } = this.props.currentUser
    const isOtherSender = message.sender_id !== user.id ? true : false
    return (
      <Message otherSender={isOtherSender} message={message} key={message.id} />
    )
  }

  render() {
    const { history } = this.props
    const { messageText, activIndicator } = this.state
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: 'white' }}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 100}
      >
        <StatusBar barStyle="dark-content" />
        {activIndicator &&
          (
            <View style={styles.indicator}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )
        }
        <FlatList
          inverted
          data={history}
          keyExtractor={this._keyExtractor}
          renderItem={({ item }) => this._renderMessageItem(item)}
          onEndReachedThreshold={5}
          onEndReached={this.getMoreMessages}
        />
        <View style={styles.container}>
          <View style={styles.inputContainer}>
            <AutoGrowingTextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="grey"
              value={messageText}
              onChangeText={this.onTypeMessage}
              maxHeight={170}
              minHeight={50}
              enableScrollToCaret
            />
            <TouchableOpacity style={styles.attachment}>
              <AttachmentIcon name="attachment" size={22} color="#8c8c8c" onPress={this.sendAttachment} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.button}>
            <Icon name="send" size={32} color="blue" onPress={this.sendMessage} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    paddingVertical: 12,
    paddingHorizontal: 35
  },
  activityIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    paddingTop: 25,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '300',
    color: '#8c8c8c',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    paddingRight: 35,
    backgroundColor: 'whitesmoke',
  },
  button: {
    width: 40,
    height: 50,
    marginBottom: Platform.OS === 'ios' ? 15 : 0,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachment: {
    width: 40,
    height: 50,
    position: 'absolute',
    right: 5,
    bottom: 0,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  inputContainer: {
    marginBottom: Platform.OS === 'ios' ? 15 : 0,
    flexDirection: 'row'
  }
});

const mapStateToProps = (state, props) => ({
  history: state.messages[props.navigation.state.params.dialog.id],
  currentUser: state.currentUser
})

export default connect(mapStateToProps)(Chat)