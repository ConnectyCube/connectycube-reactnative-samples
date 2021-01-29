import { Platform, ToastAndroid } from 'react-native';
import Toast from 'react-native-simple-toast';

export default class UtilsService {
  uuidv4() {
    // return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    //   (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    // );
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  showToast(text) {
    const commonToast = Platform.OS === 'android' ? ToastAndroid : Toast;

    commonToast.showWithGravity(text, Toast.LONG, Toast.TOP);
  };
}
