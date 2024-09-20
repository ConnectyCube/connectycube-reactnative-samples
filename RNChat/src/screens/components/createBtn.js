import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BTN_TYPE } from '../../helpers/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CreateBtn({ goToScreen, type }) {
  const { bottom } = useSafeAreaInsets();

  let renderIcon;
  switch (type) {
    case BTN_TYPE.DIALOG: {
      renderIcon = <Icon name="chat" size={30} color="white" />;
      break;
    }
    case BTN_TYPE.CONTACTS: {
      renderIcon = <Icon name="check" size={40} color="white" />;
      break;
    }
    case BTN_TYPE.CREATE_GROUP: {
      renderIcon = <Icon name="check" size={40} color="white" />;
      break;
    }
  }

  return (
    <KeyboardStickyView style={styles.container(bottom)} offset={{ closed: 0, opened: bottom }}>
      <TouchableOpacity style={styles.createDialog} onPress={goToScreen}>
        {renderIcon}
      </TouchableOpacity>
    </KeyboardStickyView>
  );
}

const styles = StyleSheet.create({
  container: (bottom = 0) => ({
    position: 'absolute',
    bottom: 20 + bottom,
    right: 20,
  }),
  createDialog: {
    width: 55,
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#48A6E3',
  },
});
