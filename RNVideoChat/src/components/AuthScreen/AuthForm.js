import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {connect} from 'react-redux';
import {
  userLogin,
  userIsLogging,
  videoCallOpponentsIds,
} from '../../actions/user';
import UserService from '../../services/UserService';
import ChatService from '../../services/ChatService';
import {users} from '../../config';
import {Actions} from 'react-native-router-flux';

class AuthForm extends React.Component {
  loginUser1() {
    this._signIn(users[0]);
    this.props.videoCallOpponentsIds([users[1].id]);
  }

  loginUser2() {
    this._signIn(users[1]);
    this.props.videoCallOpponentsIds([users[0].id]);
  }

  _signIn(userCredentials) {
    this.props.userIsLogging(true);

    UserService.signin(userCredentials)
      .then(user => {
        ChatService.connect(userCredentials)
          .then(contacts => {
            this.props.userLogin(user);
            this.props.userIsLogging(false);
            Actions.videochat();
          })
          .catch(e => {
            this.props.userIsLogging(false);
            alert(`Error.\n\n${JSON.stringify(e)}`);
          });
      })
      .catch(e => {
        this.props.userIsLogging(false);
        alert(`Error.\n\n${JSON.stringify(e)}`);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.loginUser1()}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonLabel}>Log in as Alice</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.loginUser2()}>
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonLabel}>Log in as Bob</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    user: state.user,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    userLogin: user => dispatch(userLogin(user)),
    userIsLogging: isLogging => dispatch(userIsLogging(isLogging)),
    videoCallOpponentsIds: opponentsIds =>
      dispatch(videoCallOpponentsIds(opponentsIds)),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AuthForm);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  buttonContainer: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00e3cf',
    marginHorizontal: 20,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});
