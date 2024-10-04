package com.rnvideochat;

import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import com.facebook.react.jstasks.HeadlessJsTaskRetryPolicy
import com.facebook.react.jstasks.LinearCountingRetryPolicy

class CallNotificationHeadlessJsTask : HeadlessJsTaskService() {

    private val LOGTAG = "CallNotificationBroadcastReceiver"

    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        return intent.extras?.let {
            HeadlessJsTaskConfig(
                "CallNotificationHeadlessJsTask",
                Arguments.fromBundle(it),
                5000, // timeout for the task
                false, // optional: defines whether or not the task is allowed in foreground.
            )
        }
    }
}
