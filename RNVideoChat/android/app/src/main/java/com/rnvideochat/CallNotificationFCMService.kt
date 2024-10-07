package com.rnvideochat

import android.app.ActivityManager
import android.app.ActivityManager.RunningAppProcessInfo
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Build
import android.util.Log

import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactApplicationContext
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.wix.reactnativenotifications.core.notification.IPushNotification
import com.wix.reactnativenotifications.core.notification.PushNotification

class CallNotificationFCMService : FirebaseMessagingService() {

    private val LOGTAG = "CallNotificationFCMService"

    override fun onMessageReceived(message: RemoteMessage) {
        val bundle = message.toIntent().extras ?: return
        Log.d(LOGTAG, "onMessageReceived: bundle=$bundle, foreground: $isAppOnForeground, background: $isAppInBackground, killed: $isAppKilled")

        if (isAppKilled) {
            val headlessJsTaskIntent = Intent(applicationContext, CallNotificationHeadlessJsTask::class.java)

            headlessJsTaskIntent.putExtras(bundle)
            val name = applicationContext.startService(headlessJsTaskIntent)

            if (name != null) {
                HeadlessJsTaskService.acquireWakeLockNow(applicationContext)
            }
        } else {
            Log.d(LOGTAG, "App is in foreground/background, use 'react-native-notifications' to handle the notification")

            try {
                PushNotification.get(applicationContext, bundle).onReceived()
            } catch (e: IPushNotification.InvalidNotificationException) {
                Log.v(LOGTAG, "FCM message handling aborted", e)
            }
        }
    }

    private val isAppOnForeground: Boolean
        get() {
            val context = applicationContext
            val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val appProcesses = activityManager.runningAppProcesses ?: return false
            val packageName: String = context.packageName
            for (appProcess in appProcesses) {
                if (appProcess.importance == RunningAppProcessInfo.IMPORTANCE_FOREGROUND &&
                    appProcess.processName == packageName
                ) {
                    return true
                }
            }
            return false
        }

    private val isAppInBackground: Boolean
        get() {
            val reactApplication = applicationContext as ReactApplication
            val reactInstanceManager = reactApplication.reactNativeHost.reactInstanceManager
            val reactContext = reactInstanceManager.currentReactContext
            return reactContext is ReactApplicationContext && !isAppOnForeground
        }

    private val isAppKilled: Boolean
        get() {
            return !isAppOnForeground && !isAppInBackground
        }

}
