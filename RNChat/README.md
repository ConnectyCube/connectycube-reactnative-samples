# Chat code sample for React Native for ConnectyCube platform

This README introduces [ConnectyCube](https://connectycube.com) Chat code sample for React Native

Project contains the following features implemented:

- User authorization
- Chat dialogs creation
- 1-1 messaging
- Group messaging
- Users search
- Unread messages counters
- Sent/Delivered/Read statuses
- ‘Is typing’ statuses
- File attachments
- Group chat info
- Group chat: add/remove participants
- Push Notifications for chat messages when a user is not in the app

## Documentation

ConnectyCube React Native getting started - [https://developers.connectycube.com/reactnative](https://developers.connectycube.com/reactnative)

ConnectyCube Chat API documentation - [https://developers.connectycube.com/reactnative/messaging](https://developers.connectycube.com/reactnative/messaging)

## Screenshots

<kbd><img alt="React Native chat code sample, list of chats" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_chat_chats.jpg" width="200" /></kbd> <kbd><img alt="React Native chat code sample, chat history" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_chat_chat.jpg" width="200" /></kbd> <kbd><img alt="React Native chat code sample, profile" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_chat_profile.jpg" width="200" /></kbd>

## Getting started

Quick start [React Native](https://facebook.github.io/react-native/docs/getting-started.html) app.

Prepare environment for React Native and:

1. Clone the project;
2. Install node_modules: `cd connectycube-js-samples/RNChat && npm install`
3. In order to use push notifications on Android, you need to create `google-services.json` file and copy it into project's `android/app` folder. Also, you need to update the `applicationId` in `android/app/build.gradle` to the one which is specified in `google-services.json`, so they must match. If you have no existing API project yet, the easiest way to go about in creating one is using this [step-by-step installation process](https://firebase.google.com/docs/android/setup)
4. In order for push notifications to work properly - it requires to do create a key/certificate and upload to ConnectyCube admin panel. The complete guide is available here https://developers.connectycube.com/reactnative/push-notifications
5. Run `npm run ios` or `npm run android`.

## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues)
