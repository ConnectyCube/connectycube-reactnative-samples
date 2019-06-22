import React, { Component } from 'react'
import { StatusBar, ActivityIndicator, StyleSheet, View } from 'react-native'

export default class AppLoader extends Component {
  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="white" barStyle="dark-content" animated/>
        <ActivityIndicator size="large" color="blue" />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white'
  }
})
