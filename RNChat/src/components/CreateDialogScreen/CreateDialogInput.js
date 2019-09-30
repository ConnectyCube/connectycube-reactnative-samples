import React, {Component} from 'react';
import {StyleSheet, View, TextInput, TouchableOpacity} from 'react-native';
import {Actions} from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {connect} from 'react-redux';
import {addNewDialog} from '../../actions/dialogs';
import {clearSelectedUser} from '../../actions/usersSelect';
import {usersFound} from '../../actions/usersSearch';
import Chat from '../../services/ChatService';
import Contacts from '../../services/ContactsDataService';
import CurrentUser from '../../services/CurrentUserDataService';

export class CreateDialogInput extends Component {
  state = {
    dialogName: '',
  };

  onTypeDialogName = dialogName => this.setState({dialogName});

  get dialogName() {
    const {dialogName} = this.state;

    let name = dialogName;

    if (!dialogName.trim()) {
      const {usersSelect} = this.props;
      const untilThreeIds = usersSelect.slice(0, 2);
      const names = untilThreeIds.map(id => Contacts.get(id).full_name);

      names.unshift(CurrentUser.getProp('full_name'));
      name = names.join(', ');
    }

    return name;
  }

  createDialog() {
    const {usersSelect, addNewDialog} = this.props;
    const dialogType = usersSelect.length > 1 ? 2 : 3;

    Chat.createConversation({
      type: dialogType,
      occupants_ids: usersSelect,
      name: this.dialogName,
    })
      .then(dialog => {
        addNewDialog(dialog);
        this.toChat(dialog);
      })
      .catch(e => alert(`Error.\n\n${JSON.stringify(e)}`));
  }

  toChat(dialog) {
    if (Actions.currentScene !== 'chat') {
      Actions.replace('chat', {
        dialog: dialog,
        title: dialog.name,
      });

      this.props.clearSelectedUser();
      this.props.clearSearchUsersList();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.textInput}
          placeholder="Name of the dialog"
          returnKeyType="next"
          value={this.state.dialogName}
          onChangeText={this.onTypeDialogName}
          onSubmitEditing={this.createDialog}
          underlineColorAndroid={'transparent'}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.createDialog()}>
          <Icon name="check-circle" size={40} color="blue" />
        </TouchableOpacity>
      </View>
    );
  }
}

const mapStateToProps = state => ({
  usersSelect: state.usersSelect,
});

const mapDispatchToProps = dispatch => ({
  addNewDialog: dialog => dispatch(addNewDialog(dialog)),
  clearSelectedUser: () => dispatch(clearSelectedUser()),
  clearSearchUsersList: () => dispatch(usersFound([])),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateDialogInput);

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
    padding: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '300',
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: 'whitesmoke',
  },
  button: {
    width: 40,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
