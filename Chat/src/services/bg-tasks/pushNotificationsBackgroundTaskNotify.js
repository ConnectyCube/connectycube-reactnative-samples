async function pushNotificationsBackgroundTaskNotify(notificationsBundle) {
  console.log('[pushNotificationsBackgroundTaskNotify]', notificationsBundle);
  if (notificationsBundle.foreground) {
    return;
  }

}

module.exports = pushNotificationsBackgroundTaskNotify;
