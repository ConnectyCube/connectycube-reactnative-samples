import { Dimensions } from 'react-native';

export const SIZE_SCREEN = Dimensions.get('screen');

export const BTN_TYPE = {
  DIALOG: 1,
  CONTACTS: 2,
  CREATE_GROUP: 3,
};

export const DIALOG_TYPE = {
  PRIVATE: 3,
  GROUP: 2,
  BROADCAST: 1,
  PUBLIC_CHANNEL: 4,
};
