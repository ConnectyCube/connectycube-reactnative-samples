# [ConnectyCube](https://connectycube.com) Chat sample for React Native

The README introduces [ConnectyCube](https://connectycube.com) Chat code sample for React Native

Project contains the following features implemented:

- User authorization
- User profile
- Users search
- Create, update, delete 1-1 and group chats
- Send and receive messages/images
- Send and receive sent/delivered/read message statuses
- Push notifications support

## Documentation

Getting Started - [https://developers.connectycube.com/reactnative](https://developers.connectycube.com/reactnative)

Chat API documentation - [https://developers.connectycube.com/reactnative/messaging](https://developers.connectycube.com/reactnative/messaging)

## Screenshots

<kbd><img alt="React Native chat code sample, list of chats" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_chat_chats.jpg" width="200" /></kbd> <kbd><img alt="React Native chat code sample, chat history" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_chat_chat.jpg" width="200" /></kbd> <kbd><img alt="React Native chat code sample, profile" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_chat_profile.jpg" width="200" /></kbd>

## Quick start

### Step 1: Clone the project

```bash
# Clone the project
git clone https://github.com/ConnectyCube/connectycube-reactnative-samples.git
# navigate to React Native Chat sample project
cd connectycube-reactnative-samples/RNChat
```

### Step 2: Install 'node_modules'

```bash
yarn install
```

### Step 3: Obtain ConnectyCube credentials

Register new account and application at [https://admin.connectycube.com](https://admin.connectycube.com) and then put Application credentials from 'Overview' page into `src/config.js` file:

```javascript
export const appCredentials = {
  appId: 111,
  authKey: 'zzzxxxccc',
};
```

### Step 4: Add a Firebase configuration file

**Android**

Go to the [Firebase console](https://console.firebase.google.com/), create Android app and download **google-services.json**. Then put it into **RNChat/android/app/google-services.json** location.

Follow <https://firebase.google.com/docs/android/setup#console> (Option 1, Step 1 and 2) for more detailed guide how to obtain Firebase configuration file for Android.

**iOS**

Go to the [Firebase console](https://console.firebase.google.com/), create iOS app and download **GoogleService-Info.plist**. Then put it into **RNChat/ios/RNChat/GoogleService-Info.plist** location.

Follow <https://firebase.google.com/docs/ios/setup> (Step 1, 2 and 3) for more detailed guide how to obtain Firebase configuration file for iOS.

### Step 5: Start the Metro Server

```bash
yarn start
```

### Step 6: Start the Application

For Android, run the followinf command in termnial to run the app:

```bash
yarn android
```

For iOS, do:

```bash
cd ios
pod install
```

Then open **RNChat/ios/RNChat.xcworkspace** in Xcode and run the project.

## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues).
