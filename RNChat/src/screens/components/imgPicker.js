import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-crop-picker';

import Avatar from './avatar';

const ImgPicker = ({ name, photo, pickPhoto, isDisabled = false }) => {
  const [isPickImage, setIsPickImage] = useState(null);

  const onPickImage = async () => {
    const image = await ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
    });
    pickPhoto(image);
    setIsPickImage(image);
  };

  return (
    <TouchableOpacity onPress={onPickImage} style={styles.picker} disabled={isDisabled}>
      {isPickImage
        ? (
          <>
            <Image
              style={styles.imgPicker}
              source={{ uri: isPickImage.path }}
            />
            <View style={styles.icon}>
              <Icon name="create" size={20} color="#48A6E3" />
            </View>
          </>
        )
        : (
          <View>
            <Avatar
              photo={photo}
              name={name}
              iconSize="extra-large"
            />
            {!isDisabled
            && (
              <View style={styles.icon}>
                <Icon name="create" size={20} color="#48A6E3" />
              </View>
            )}
          </View>
        )}
    </TouchableOpacity>
  );
};

export default ImgPicker;

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
