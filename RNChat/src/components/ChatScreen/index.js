import React, {Component} from 'react';
import ConnectyCube from 'connectycube-reactnative';
import {
  StyleSheet,
  KeyboardAvoidingView,
  ActivityIndicator,
  FlatList,
  StatusBar,
  Platform,
  View,
  TouchableOpacity,
} from 'react-native';
import SoftInputMode from 'react-native-set-soft-input-mode';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
import {fetchMessages, pushMessage} from '../../actions/messages';
import {sortDialogs} from '../../actions/dialogs';
import {setSelected, removeSelected} from '../../actions/selected';
import Chat from '../../services/ChatService';
import MessageModel from '../../models/Message';
import Message from './Message';

export class ChatScreen extends Component {
  constructor(props) {
    super(props);

    this.setState({inProgress: true});
    this.props.fetchMessages([]);
  }

  state = {
    inProgress: true,
    messageValue: '',
  };

  static getDerivedStateFromState(nextProps) {
    nextProps.setSelected(nextProps.dialog);
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      SoftInputMode.set(SoftInputMode.ADJUST_RESIZE);
    }

    const {fetchMessages, dialog} = this.props;

    Chat.getHistory(dialog.id)
      .then(fetchMessages)
      .catch(e => alert(`Error.\n\n${JSON.stringify(e)}`))
      .then(() => this.setState({inProgress: false}));
  }

  componentWillUnmount() {
    this.props.removeSelected();
  }

  onTypeMessage = messageValue => this.setState({messageValue});

  sendMessage = () => {
    const {user, dialog, pushMessage, sortDialogs} = this.props;
    const text = this.state.messageValue.trim();
    const date = Math.floor(Date.now() / 1000);

    if (!text) return;

    let msg = {
      type: dialog.xmpp_type,
      body: text,
      extension: {
        save_to_history: 1,
        dialog_id: dialog.id,
        sender_id: user.id,
        date_sent: date,
      },
      markable: 1,
    };

    msg.id = ConnectyCube.chat.send(dialog.destination, msg);

    const message = new MessageModel(msg);

    pushMessage(message);
    sortDialogs(message);
    this.setState({messageValue: ''});
  };

  _renderMessageItem(message) {
    isOtherSender = message.sender_id !== this.props.user.id;

    return (
      <Message otherSender={isOtherSender} message={message} key={message.id} />
    );
  }

  render() {
    const {history} = this.props;
    const {messageValue, inProgress} = this.state;

    return (
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: 'white'}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={0}>
        <StatusBar backgroundColor="blue" barStyle="light-content" animated />
        {inProgress && (
          <ActivityIndicator
            style={styles.activityIndicator}
            size="small"
            color="blue"
          />
        )}
        <FlatList
          inverted
          data={history}
          keyExtractor={item => item.id}
          renderItem={({item}) => this._renderMessageItem(item)}
        />
        <View style={styles.container}>
          <AutoGrowingTextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={messageValue}
            onChangeText={this.onTypeMessage}
            maxHeight={170}
            minHeight={50}
            enableScrollToCaret
          />
          <TouchableOpacity style={styles.button} onPress={this.sendMessage}>
            <Icon name="send" size={32} color="blue" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    padding: 12,
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
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 14 : 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: 'whitesmoke',
  },
  button: {
    width: 40,
    height: 50,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = state => ({
  history: state.messages,
  user: state.user,
});

const mapDispatchToProps = dispatch => ({
  fetchMessages: history => dispatch(fetchMessages(history)),
  pushMessage: message => dispatch(pushMessage(message)),
  sortDialogs: message => dispatch(sortDialogs(message)),
  setSelected: dialog => dispatch(setSelected(dialog)),
  removeSelected: () => dispatch(removeSelected()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChatScreen);
