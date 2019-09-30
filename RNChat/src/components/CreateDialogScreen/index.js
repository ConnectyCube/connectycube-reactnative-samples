import React, {Component} from 'react';
import {
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  FlatList,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {Header} from 'react-navigation-stack';
import {connect} from 'react-redux';
import User from './user';
import {clearSelectedUser} from '../../actions/usersSelect';
import {usersFound} from '../../actions/usersSearch';
import CreateDialogInput from './CreateDialogInput';

class CreateDialogScreen extends Component {
  componentWillUnmount() {
    this.props.clearSelectedUser();
    this.props.clearSearchUsersList();
  }

  _renderUsers(user) {
    return <User user={user} />;
  }

  render() {
    const {usersSearch, usersSelect} = this.props;

    return (
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: 'white'}}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? Header.HEIGHT + 20 : 0}>
        <StatusBar backgroundColor="blue" barStyle="light-content" animated />
        <View style={styles.information}>
          {usersSearch.inProgress && (
            <ActivityIndicator size="large" color="blue" />
          )}
          {!!usersSearch.text && (
            <Text style={styles.warnText}>{usersSearch.text}</Text>
          )}
          {!usersSearch.inProgress &&
            !usersSearch.text &&
            !usersSearch.result.length && (
              <Text style={styles.warnText}>Type to search users</Text>
            )}
        </View>
        <FlatList
          data={usersSearch.result}
          keyExtractor={item => String(item.id)}
          renderItem={({item}) => this._renderUsers(item)}
        />
        {!!usersSelect.length && <CreateDialogInput />}
      </KeyboardAvoidingView>
    );
  }
}

const mapStateToProps = state => ({
  usersSearch: state.usersSearch,
  usersSelect: state.usersSelect,
});

const mapDispatchToProps = dispatch => ({
  clearSelectedUser: () => dispatch(clearSelectedUser()),
  clearSearchUsersList: () => dispatch(usersFound([])),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateDialogScreen);

const styles = StyleSheet.create({
  information: {
    position: 'absolute',
    alignSelf: 'center',
    top: '42%',
  },
  warnText: {
    fontSize: 20,
  },
});
