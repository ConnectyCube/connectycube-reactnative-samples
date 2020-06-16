import { Alert } from 'react-native';

const showAlert = (message, title = '') =>
  Alert.alert(
    title,
    message,
    [
      { text: 'Ok' },
    ],
    { cancelable: false },
  );


export { showAlert };
