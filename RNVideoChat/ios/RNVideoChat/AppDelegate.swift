import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import PushKit
import RNVoipPushNotification
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, PKPushRegistryDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?
  var voipRegistry: PKPushRegistry?

  private let PAYLOAD_STORAGE_KEY = "VoIPCallPayloads"

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    FirebaseApp.configure()

    let appName = Bundle.main.infoDictionary?["CFBundleDisplayName"] as? String ?? "RNVideoChat"

    RNCallKeep.setup([
      "appName": appName,
      "supportsVideo": false,
      "includesCallsInRecents": false
    ])

    RNVoipPushNotificationManager.voipRegistration()
    voipRegistry = PKPushRegistry(queue: .main)
    voipRegistry?.delegate = self
    voipRegistry?.desiredPushTypes = [.voIP]

    UNUserNotificationCenter.current().delegate = self

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "rnvideochat",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // MARK: - PKPushRegistryDelegate
  func pushRegistry(_ registry: PKPushRegistry, didUpdate credentials: PKPushCredentials, for type: PKPushType) {
    RNVoipPushNotificationManager.didUpdate(credentials, forType: type.rawValue)
  }

  // incoming push
  func pushRegistry(_ registry: PKPushRegistry,
                    didReceiveIncomingPushWith payload: PKPushPayload,
                    for type: PKPushType,
                    completion: @escaping () -> Void) {

    let data = payload.dictionaryPayload
    let message = (data["message"] as? String) ?? "Incoming call"
    let callerName = (data["handle"] as? String) ?? "Unknown"
    let uuid = (data["uuid"] as? String) ?? UUID().uuidString
    let isVideo = ((data["callType"] as? String) == "video")

    if let aps = data["aps"] as? [String: Any],
      let alert = (aps["alert"] as? String) {
      let storage = UserDefaults(suiteName: "rnvideochat-storage")

      storage?.set(alert, forKey: uuid)
      storage?.synchronize()
    }

    RNVoipPushNotificationManager.addCompletionHandler(uuid, completionHandler: completion)
    RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)

    // CallKit UI
    RNCallKeep.reportNewIncomingCall(
      uuid,
      handle: message,
      handleType: "generic",
      hasVideo: isVideo,
      localizedCallerName: callerName,
      supportsHolding: true,
      supportsDTMF: true,
      supportsGrouping: true,
      supportsUngrouping: true,
      fromPushKit: true,
      payload: data,
      withCompletionHandler: nil
    )
  }

  // MARK: - UNUserNotificationCenterDelegate
  func userNotificationCenter(_ center: UNUserNotificationCenter,
                              willPresent notification: UNNotification,
                              withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
    completionHandler([.sound, .banner, .badge])
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
