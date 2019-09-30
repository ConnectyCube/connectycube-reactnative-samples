import React, {Component} from 'react';
import {AppState} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {connect} from 'react-redux';
import {userLogin} from '../actions/user';
import {fetchDialogs, sortDialogs} from '../actions/dialogs';
import {chatConnected, chatDisconnected} from '../actions/connection';
import {pushMessage} from '../actions/messages';
import ConnectyCube from 'connectycube-reactnative';
import appConfig from '../../app.json';
import AppRouter from '../router';
import Message from '../models/Message';
import User from '../services/UserService';
import Chat from '../services/ChatService';
import PushNotificationService from '../services/PushNotification';

class AppRoot extends Component {
  constructor(props) {
    super(props);

    AppState.addEventListener('change', this._handleAppStateChange.bind(this));

    ConnectyCube.init(...appConfig.connectyCubeConfig);

    User.autologin()
      .then(user => {
        this.props.userLogin(user);
        new PushNotificationService(this.onNotificationListener);
      })
      .catch(() => Actions.auth());

    this._setupListeners();
  }

  static appIsActive = true;
  static waitConnect = false;

  componentWillUnmount() {
    AppState.removeEventListener(
      'change',
      this._handleAppStateChange.bind(this),
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    AppRoot._connect(nextProps);
  }

  /*               *
   * Render method *
   *               */
  render() {
    return <AppRouter />;
  }

  /*               *
   * Chat activity *
   *               */
  _handleAppStateChange(nextAppState) {
    if (nextAppState === 'active') {
      AppRoot.appIsActive = true;
      this._reconnect();
    } else {
      AppRoot.appIsActive = false;
      this._disconnect();
    }
  }

  static _connect(props) {
    const {connected, user, chatConnected, fetchDialogs} = props;

    if (AppRoot.appIsActive && user && !connected && !AppRoot.waitConnect) {
      AppRoot.waitConnect = true;

      Chat.getConversations()
        .then(dialogs => {
          Actions.dialogs();
          Chat.connect(user, dialogs);
          fetchDialogs(dialogs);
        })
        .then(() => {
          chatConnected();
        })
        .catch(e => alert(`Error.\n\n${JSON.stringify(e)}`))
        .then(() => (AppRoot.waitConnect = false));
    }
  }

  _reconnect() {
    const {connected, user, chatConnected} = this.props;

    if (AppRoot.appIsActive && user && !connected && !AppRoot.waitConnect) {
      AppRoot.waitConnect = true;

      Chat.getConversations()
        .then(dialogs => {
          Chat.connect(user, dialogs);
          fetchDialogs(dialogs);
        })
        .then(chatConnected)
        .catch(e => alert(`Error.\n\n${JSON.stringify(e)}`))
        .then(() => (AppRoot.waitConnect = false));
    }
  }

  _disconnect() {
    this.props.chatDisconnected();
    Chat.disonnect();
  }

  _setupListeners() {
    ConnectyCube.chat.onDisconnectedListener = this.props.chatDisconnected;
    ConnectyCube.chat.onReconnectedListener = this.props.chatDisconnected;
    ConnectyCube.chat.onMessageListener = this._onMessageListener.bind(this);
    // ConnectyCube.chat.onSentMessageCallback = this._onSentMessage.bind(this)
  }

  _onMessageListener(id, msg) {
    const {user, selected, pushMessage, sortDialogs} = this.props;
    const message = new Message(msg);

    if (id !== user.id) {
      if (selected.id === message.dialog_id) {
        pushMessage(message);
        sortDialogs(message);
        Chat.readMessage(message.id, message.dialog_id);
      } else {
        sortDialogs(message, true);
      }
    }
  }

  // _onSentMessage(failedMessage, successMessage) {
  // 	if (failedMessage && !successMessage) {
  // 		console.log('Send message - FAIL');
  // 	} else {
  // 		console.log('Send message - SUCCESS');
  // 	}
  // }

  onNotificationListener(notification) {
    Actions.dialogs();
  }
}

const mapStateToProps = state => ({
  connected: state.connection,
  user: state.user,
  selected: state.selected,
  dialogs: state.dialogs,
});

const mapDispatchToProps = dispatch => ({
  chatConnected: () => dispatch(chatConnected()),
  chatDisconnected: () => dispatch(chatDisconnected()),
  userLogin: user => dispatch(userLogin(user)),
  fetchDialogs: dialogs => dispatch(fetchDialogs(dialogs)),
  sortDialogs: (message, count) => dispatch(sortDialogs(message, count)),
  pushMessage: message => dispatch(pushMessage(message)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppRoot);
