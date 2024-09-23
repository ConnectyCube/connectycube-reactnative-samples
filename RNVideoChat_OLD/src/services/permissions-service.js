import { isOverlayPermissionGranted, requestOverlayPermission } from 'react-native-can-draw-overlays';
import { Alert } from "react-native";

class PermissionsService {
  constructor() {
    if (PermissionsService.instance) {
      return PermissionsService.instance;
    }

    PermissionsService.instance = this;
  }

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
            onPress: () => { },
            style: "cancel"
          },
          {
            text: "Request", onPress: () => {
              this.requestOverlayPermission();
            }
          }
        ]
      );

    }
  }

  async isDrawOverlaysPermisisonGranted() {
    const isGranted = await isOverlayPermissionGranted();
    console.log("[PermissionsService][isDrawOverlaysPermisisonGranted]", isGranted);
    return isGranted;
  }

  async requestOverlayPermission() {
    const granted = await requestOverlayPermission();
    console.log("[PermissionsService][requestOverlayPermission]", granted);
    return granted;
  }
}

export default new PermissionsService();