import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { BTN_TYPE } from '../../helpers/constants';

const CreateBtn = ({ goToScreen, type }) => {
  let renderIcon;
  switch (type) {
  case BTN_TYPE.DIALOG:
    renderIcon = (<Icon name="chat" size={30} color="white" />);
    break;
  case BTN_TYPE.CONTACTS:
    renderIcon = (<Icon name="check" size={40} color="white" />);
    break;
  case BTN_TYPE.CREATE_GROUP:
    renderIcon = (<Icon name="check" size={40} color="white" />);
    break;
  default:
    break;
  }

  return (
    <TouchableOpacity style={styles.createDialog} onPress={goToScreen}>
      {renderIcon}
    </TouchableOpacity>
  );
};

export default CreateBtn;

const styles = StyleSheet.create({
  createDialog: {
    position: 'absolute',
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    bottom: 40,
    right: 30,
    backgroundColor: '#48A6E3',
  },
});
