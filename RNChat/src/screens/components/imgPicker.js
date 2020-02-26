import React, { Component } from 'react'
import { StyleSheet, View, TouchableOpacity, Image, KeyboardAvoidingView } from 'react-native'
import Avatar from './avatar'
import Icon from 'react-native-vector-icons/MaterialIcons'
import ImagePicker from 'react-native-image-crop-picker'

export default class ImgPicker extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isPickImage: false,
      isPickImage: null
    }
  }

  onPickImage = () => {
    const { pickPhoto } = this.props
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true
    }).then(image => {
      pickPhoto(image)
      this.setState({ isPickImage: image })
    })
  }

  render() {
    const { isPickImage } = this.state
    const { name, photo, isDidabled = false } = this.props
    return (
      <TouchableOpacity onPress={this.onPickImage} style={styles.picker} disabled={isDidabled}>
        {isPickImage ? (
          <>
            <Image
              style={styles.imgPicker}
              source={{ uri: isPickImage.path }}
            />
            <View style={styles.icon}>
              <Icon name="create" size={20} color='#48A6E3' />
            </View>
          </>
        ) :
          <View>
            <Avatar
              photo={photo}
              name={name}
              iconSize="extra-large"
            />
            {!isDidabled &&
              <View style={styles.icon}>
                <Icon name="create" size={20} color='#48A6E3' />
              </View>
            }
          </View>
        }
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  picker: {
    width: 102,
    height: 102
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
})
