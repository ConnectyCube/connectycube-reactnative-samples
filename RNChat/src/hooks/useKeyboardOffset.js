import { StatusBar } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { isAndroid } from '../helpers/platform';

export default function useKeyboardOffset() {
  const headerHeight = useHeaderHeight();
  const statusBarHeight = StatusBar.currentHeight || 0;

  return isAndroid ? headerHeight + statusBarHeight : headerHeight;
}
