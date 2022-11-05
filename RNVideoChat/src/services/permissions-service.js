import { isOverlayPermissionGranted, requestOverlayPermission } from 'react-native-can-draw-overlays';
import { Alert } from "react-native";

class PermisisonsService {
  async checkAndRequestDrawOverlaysPermission() {
    if (Platform.OS !== 'android') {
      return true;
    }

    const isGranted = await this.isDrawOverlaysPermisisonGranted();
    if (!isGranted) {
      Alert.alert(
        "Permission required",
        "For accepting calls in background you should provide access to show System Alerts from in background. Would you like to do it now?",
        [
          {
            text: "Later",
            onPress: () => {},
            style: "cancel"
          },
          { text: "Request", onPress: () => {
            this.requestOverlayPermission();
          }}
        ]
      );
  
    }
  }
    
  async isDrawOverlaysPermisisonGranted() {
    const isGranted = await isOverlayPermissionGranted();
    console.log("[PermisisonsService][isDrawOverlaysPermisisonGranted]", isGranted);
    return isGranted;
  }

  async requestOverlayPermission() {
    const granted = await requestOverlayPermission();
    console.log("[PermisisonsService][requestOverlayPermission]", granted);
    return granted;
  }
}

const permisisonsService = new PermisisonsService();
export default permisisonsService;