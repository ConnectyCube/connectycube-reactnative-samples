package com.rnvideochat

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

import com.facebook.react.ReactApplication
import com.facebook.react.bridge.ReactApplicationContext
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.wix.reactnativenotifications.BuildConfig
import com.wix.reactnativenotifications.core.notification.IPushNotification
import com.wix.reactnativenotifications.core.notification.PushNotification

import com.rnvideochat.CallNotificationActionReceiver

class CallNotificationFCMService : FirebaseMessagingService() {

    private val LOGTAG = "CallNotificationFCMService"
    private val PREFS_NAME = "RN_VIDEO_CHAT_BUNDLE"
    private val CHANNEL_ID = "rn_video_chat_channel"

    override fun onMessageReceived(message: RemoteMessage) {
        val bundle = message.toIntent().extras ?: return
        Log.d(LOGTAG, "onMessageReceived: bundle=$bundle")
        saveToSharedPreferences(bundle)        
        Log.d(LOGTAG, "onMessageReceived: saveToSharedPreferences")
        createNotificationChannel()
        Log.d(LOGTAG, "onMessageReceived: createNotificationChannel")
        startForegroundService(bundle)
        Log.d(LOGTAG, "onMessageReceived: startForegroundService")
    }

    private fun saveToSharedPreferences(bundle: Bundle) {
        val sharedPreferences = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        with(sharedPreferences.edit()) {
            bundle.keySet().forEach { key ->
                val value = bundle.get(key)
                when (value) {
                    is String -> putString(key, value)
                    is Int -> putInt(key, value)
                    is Long -> putLong(key, value)
                    is Boolean -> putBoolean(key, value)
                    is Float -> putFloat(key, value)
                    else -> Log.w(LOGTAG, "SharedPreferences: 'unsupported type for key: $key'")
            }
        }
        apply()
    }
    }

    private fun createPendingIntent(action: String, code: Int): PendingIntent {
        val pendingIntentFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            PendingIntent.FLAG_MUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }
        val intent = Intent(this, CallNotificationActionReceiver::class.java).apply {
            this.action = action
            putExtra("prefsName", PREFS_NAME)
        }
        return PendingIntent.getBroadcast(this, code, intent, pendingIntentFlag)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "RNVideoChat Call Notifications"
            val descriptionText = "Notifications for incoming calls"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun showNotification(bundle: Bundle) {
        val notificationID = 24680
        val caller = bundle.getString("handle") ?: "Unknown"
        val message = bundle.getString("message") ?: "Incoming call from $caller"
        val callType = bundle.getString("callType") ?: "audio"
        val acceptPendingIntent: PendingIntent = createPendingIntent(CallNotificationActionReceiver.ACTION_ACCEPT_CALL, 0)
        val declinePendingIntent: PendingIntent = createPendingIntent(CallNotificationActionReceiver.ACTION_DECLINE_CALL, 1)
        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("Incoming $callType call")
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .addAction(R.drawable.ic_check, "Accept", acceptPendingIntent)
            .addAction(R.drawable.ic_close, "Decline", declinePendingIntent)
            .setAutoCancel(true)

        with(NotificationManagerCompat.from(this)) {
            notify(notificationID, builder.build())
            Handler(Looper.getMainLooper()).postDelayed({
                cancel(notificationID)
            }, 60000)
        }
    }

    private fun startForegroundService(bundle: Bundle) {
        val notificationID = 13579
        val caller = bundle.getString("handle") ?: "Unknown"
        val message = bundle.getString("message") ?: "Incoming call from $caller"
        val callType = bundle.getString("callType") ?: "audio"

        val acceptPendingIntent: PendingIntent = createPendingIntent(CallNotificationActionReceiver.ACTION_ACCEPT_CALL, 0)
        val declinePendingIntent: PendingIntent = createPendingIntent(CallNotificationActionReceiver.ACTION_DECLINE_CALL, 1)

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher)
            .setContentTitle("Incoming $callType call")
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .addAction(R.drawable.ic_check, "Accept", acceptPendingIntent)
            .addAction(R.drawable.ic_close, "Decline", declinePendingIntent)
            .setAutoCancel(true)
            .build()

        startForeground(notificationID, notification)
        showNotification(bundle)

        // Schedule notification cancel after 60 seconds if not acted upon
        Handler(Looper.getMainLooper()).postDelayed({
            stopForeground(true)
            stopSelf()
        }, 60000)
    }
}
