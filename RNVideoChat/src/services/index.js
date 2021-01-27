import Auth from './auth-service';
import Call from './call-service';
import PushNotifications from './pushnotifications-service';

export const AuthService = new Auth();
export const CallService = new Call();
export const PushNotificationsService = new PushNotifications();
