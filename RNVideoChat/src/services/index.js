import Auth from './auth-service';
import Call from './call-service';
import PushNotifications from './pushnotifications-service';
import Utils from './utils-service';

export const AuthService = new Auth();
export const CallService = new Call();
export const PushNotificationsService = new PushNotifications();
export const UtilsService = new Utils();
