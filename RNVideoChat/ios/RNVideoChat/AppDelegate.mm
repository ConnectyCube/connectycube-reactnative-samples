#import "AppDelegate.h"
#import "RNNotifications.h"
#import "RNEventEmitter.h"
#import "RNCallKeep.h"

#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"RNVideoChat";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  [RNNotifications startMonitorNotifications];
  [RNNotifications startMonitorPushKitNotifications];

  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handlePushKitNotificationReceived:)
                                               name:RNPushKitNotificationReceived
                                             object:nil];
  // cleanup
  [[NSUserDefaults standardUserDefaults] removeObjectForKey:@"voipIncomingCallSessions"];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  [RNNotifications didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  [RNNotifications didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult result))completionHandler {
  [RNNotifications didReceiveBackgroundNotification:userInfo withCompletionHandler:completionHandler];
}

- (void)handlePushKitNotificationReceived:(NSNotification *)notification {
  UIApplicationState state = [[UIApplication sharedApplication] applicationState];
  
  if (state == UIApplicationStateBackground || state == UIApplicationStateInactive) {
    // save call info to user defaults
    NSMutableDictionary *callsInfo = [[[NSUserDefaults standardUserDefaults] objectForKey:@"voipIncomingCallSessions"] mutableCopy];

    if (callsInfo == nil) {
      callsInfo = [NSMutableDictionary dictionary];
    }

    [callsInfo setObject:@{
       @"initiatorId": notification.userInfo[@"initiatorId"],
      @"opponentsIds": notification.userInfo[@"opponentsIds"],
            @"handle": notification.userInfo[@"handle"],
          @"callType": notification.userInfo[@"callType"]
    } forKey:notification.userInfo[@"uuid"]];

    [[NSUserDefaults standardUserDefaults] setObject:callsInfo forKey:@"voipIncomingCallSessions"];
    
    // show CallKit incoming call screen
    [RNCallKeep reportNewIncomingCall: notification.userInfo[@"uuid"]
                               handle: notification.userInfo[@"handle"]
                           handleType: @"generic"
                             hasVideo: [notification.userInfo[@"callType"] isEqual: @"video"]
                  localizedCallerName: notification.userInfo[@"handle"]
                      supportsHolding: YES
                         supportsDTMF: YES
                     supportsGrouping: YES
                   supportsUngrouping: YES
                          fromPushKit: YES
                              payload: notification.userInfo
                withCompletionHandler: nil];
  } else {
    // when an app is in foreground -> will show the in-app UI for incoming call
  }
}

@end
