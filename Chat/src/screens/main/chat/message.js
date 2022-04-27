import React, { Component } from 'react'
import { StyleSheet, View, Text, Dimensions, TouchableOpacity, Modal, Platform } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer'
import store from '../../../store'
import Avatar from '../../components/avatar'
import { getTime } from '../../../helpers/getTime'
import MessageSendState from '../../components/messageSendState'
import ChatImage from '../../components/chatImage'
import Icon from 'react-native-vector-icons/AntDesign'

const fullWidth = Dimensions.get('window').width
const fullHeight = Dimensions.get('window').height

export default class Message extends Component {
  isAtachment = null

  constructor(props) {
    super(props)
    this.state = {
      isModal: false,
      send_state: props.message.send_state
    }
    this.isAtachment = props.message.attachment
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextProps.message.send_state != nextState.send_state ||
      nextState.isModal !== this.state.isModal
    ) {
      return true
    } else {
      return false
    }
  }


  renderAttachment = () => {
    const { message } = this.props
    return (
      <TouchableOpacity style={{ marginBottom: 3 }} onPress={this.handleModalState}>
        <ChatImage photo={message.attachment[0].url} width={200} height={150} />
      </TouchableOpacity>
    )
  }

  handleModalState = () => {
    this.setState({ isModal: !this.state.isModal })
  }

  renderHeader = () => {
    return <View style={[{ margin: Platform.OS === 'ios' ? 35 : 15 }, { position: 'absolute', zIndex: 10 }]}>
      <Icon name="close" size={30} color='white' onPress={this.handleModalState} />
    </View>
  }

  render() {
    const { message, otherSender } = this.props
    const { isModal } = this.state
    const user = otherSender ? store.getState().users[message.sender_id] : '.'
    return (
      <View>
        {this.isAtachment &&
          <Modal visible={isModal} transparent={false} style={{ backgroundColor: 'black' }}>
            <View style={{
              width: fullWidth,
              height: fullHeight,
            }}>
              <ImageViewer
                imageUrls={[{ url: message.attachment[0].url }]}
                onCancel={() => this.handleModalState()}
                enableSwipeDown
                renderIndicator={() => null}
                renderHeader={this.renderHeader}
                renderImage={props => (
                  <ChatImage
                    photo={props.source.uri}
                    width={+message.attachment[0].width}
                    height={+message.attachment[0].height}
                  />
                )}
              />
            </View>
          </Modal>
        }
        {otherSender ?
          (
            <View style={[styles.container, styles.positionToLeft]}>
              <Avatar
                photo={user.avatar}
                name={user.full_name}
                iconSize="small"
              />
              <View style={[styles.message, styles.messageToLeft]}>
                {this.isAtachment &&
                  this.renderAttachment()
                }
                <Text style={[styles.messageText, (otherSender ? styles.selfToLeft : styles.selfToRight)]}>
                  {message.body || ' '}
                </Text>
                <Text style={styles.dateSent}>
                  {getTime(message.date_sent)}
                </Text>
              </View>
            </View>
          ) :
          (
            <View style={[styles.container, styles.positionToRight]}>
              <View style={[styles.message, styles.messageToRight]}>
                {this.isAtachment &&
                  this.renderAttachment()
                }
                <Text style={[styles.messageText, styles.selfToRight]}>
                  {message.body || ' '}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <Text style={styles.dateSent}>
                    {getTime(message.date_sent)}
                  </Text>
                  <MessageSendState send_state={message.send_state} />
                </View>
              </View>
            </View>
          )
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  positionToLeft: {
    justifyContent: 'flex-start'
  },
  positionToRight: {
    justifyContent: 'flex-end'
  },
  message: {
    paddingTop: 5,
    paddingBottom: 3,
    paddingHorizontal: 6,
    borderRadius: 10
  },
  messageToLeft: {
    maxWidth: fullWidth - 90,
    borderBottomLeftRadius: 2,
    backgroundColor: '#63D9C6'
  },
  messageToRight: {
    maxWidth: fullWidth - 55,
    borderBottomRightRadius: 2,
    backgroundColor: '#48A6E3'
  },
  messageText: {
    fontSize: 16,
    color: 'white'
  },
  selfToLeft: {
    alignSelf: 'flex-start'
  },
  selfToRight: {
    alignSelf: 'flex-end'
  },
  dateSent: {
    alignSelf: 'flex-end',
    paddingTop: 1,
    paddingHorizontal: 3,
    fontSize: 12,
    color: 'lightcyan'
  }
})
