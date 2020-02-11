import React, { Component } from 'react'
import { StyleSheet, View, Image } from 'react-native'
import AuthService from '../services/auth-service'
import ChatService from '../services/chat-service'

export default class AppWrap extends Component {
  constructor(props) {
    super(props)
    this.initUser()
  }

  initUser = async () => {
    const { navigation } = this.props
    const rootStackScreen = await AuthService.init()
    if (rootStackScreen === 'Dialogs') {
      ChatService.setUpListeners()
    }
    navigation.navigate(rootStackScreen)
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.imageSize} source={require('../../assets/image/logo_with_text.png')} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSize: {
    width: 200,
    height: 150
  },
})
