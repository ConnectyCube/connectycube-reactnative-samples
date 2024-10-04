package com.rnvideochat

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.util.Log

class CallNotificationActionReceiver : BroadcastReceiver() {

    private val LOGTAG = "CallNotificationActionReceiver"

    companion object {
        const val ACTION_ACCEPT_CALL = "ACTION_ACCEPT_CALL"
        const val ACTION_DECLINE_CALL = "ACTION_DECLINE_CALL"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val bundle = intent.extras ?: return
        val prefsName = bundle.getString("prefsName") ?: return

        val sharedPreferences = context.getSharedPreferences(prefsName, Context.MODE_PRIVATE)
        val mainIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("action", action)
            sharedPreferences.all.forEach { (key, value) ->
                when (value) {
                    is String -> putExtra(key, value)
                    is Int -> putExtra(key, value)
                    is Long -> putExtra(key, value)
                    is Boolean -> putExtra(key, value)
                    is Float -> putExtra(key, value)
                    else -> Log.w(LOGTAG, "SharedPreferences: 'unsupported type for key: $key'")
                }
            }
            putExtras(bundle)
        }

        context.startActivity(mainIntent)
    }
}