import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import Avatar from './avatar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';

export default function ImgPicker({ name, photo, onPickPhoto, onCancelPickPhoto, disabled = false }) {

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const onPickImage = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    }).then(image => {
      onPickPhoto(image);
      setSelectedPhoto(image);
    }).catch((_error) => {
      onCancelPickPhoto();
    });
  };

  return (
    <TouchableOpacity onPress={onPickImage} style={styles.picker} disabled={disabled}>
      {selectedPhoto ? (
        <>
          <Image
            style={styles.imgPicker}
            source={{ uri: selectedPhoto.path }}
          />
          <View style={styles.icon}>
            <Icon name="create" size={20} color="#48A6E3" />
          </View>
        </>
      ) :
        <View>
          <Avatar
            photo={photo}
            name={name}
            iconSize="extra-large"
          />
          {!disabled &&
            <View style={styles.icon}>
              <Icon name="create" size={20} color="#48A6E3" />
            </View>
          }
        </View>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  picker: {
    width: 102,
    height: 102,
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
    borderColor: '#48A6E3',
  },
});
