import { Alert } from 'react-native';

export function showAlert(message, title = '') {
  Alert.alert(
    title,
    message,
    [
      { text: 'Ok' },
    ],
    { cancelable: false },
  );
}
