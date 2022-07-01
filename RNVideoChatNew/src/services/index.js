import Auth from './auth-service';
import Call from './call-service';
import PushNotifications from './pushnotifications-service';
import Utils from './utils-service';
import CallKit from './callkit-service';
import Users from './users-service';

export const AuthService = new Auth();
export const CallService = new Call();
export const PushNotificationsService = new PushNotifications();
export const UtilsService = new Utils();
export const CallKitService = new CallKit();
export const UsersService = new Users();
