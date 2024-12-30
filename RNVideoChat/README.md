
# [ConnectyCube](https://connectycube.com) Video Chat sample for React Native

This README introduces [ConnectyCube](https://connectycube.com) Video Chat code sample for React Native

Project contains the following features implemented:

- User authorization
- Video/audio calls up to 4 users
- Mute/unmute microphone
- Mute/unmute video
- Switch camera
- Receive incoming calls in background/killed state (Android)
- iOS CallKit (coming soon)
- Snack bars to notify users about changes

## Documentation

Getting Started - [https://developers.connectycube.com/reactnative](https://developers.connectycube.com/reactnative)

Video Chat API documentation - [https://developers.connectycube.com/reactnative/videocalling](https://developers.connectycube.com/reactnative/videocalling)

## Screenshots

<kbd><img alt="React Native video chat code sample, login" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_login.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, select users" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_select_users.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, video chat" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_video.PNG" width="200" /></kbd>

## Quick start

### Step 1: Clone the project

Clone the project:

```bash
# clone the project
git clone https://github.com/ConnectyCube/connectycube-reactnative-samples.git
# navigate to React Native Video Chat sample project
cd connectycube-reactnative-samples/RNVideoChat
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
  authKey: 'zzzxxxccc'
};
```

Also, create from 2 to 4 users in 'Users' module and put them into `src/config.js` file as well:

```javascript
export const users = [
  {
    id: 10001,
    full_name: 'User1',
    login: 'videouser1',
    password: 'videouser1',
    color: '#34ad86',
  },
  {
    id: 10002,
    full_name: 'User2',
    login: 'videouser2',
    password: 'videouser2',
    color: '#077988',
  },
  {
    id: 10003,
    full_name: 'User3',
    login: 'videouser3',
    password: 'videouser3',
    color: '#13aaae',
  },
  {
    id: 10004,
    full_name: 'User4',
    login: 'videouser4',
    password: 'videouser4',
    color: '#056a96',
  },
];
```

### Step 4: Add a Firebase configuration file

**Android**

Go to the [Firebase console](https://console.firebase.google.com/), create Android app and download **google-services.json**. Then put it into **RNVideoChat/android/app/google-services.json** location. 

Follow https://firebase.google.com/docs/android/setup#console (Option 1, Step 1 and 2) for more detailed guide how to obtain Firebase configuration file for Android.

**iOS**

Go to the [Firebase console](https://console.firebase.google.com/), create iOS app and download **GoogleService-Info.plist**. Then put it into **RNVideoChat/ios/RNVideoChat/GoogleService-Info.plist** location. 

Follow https://firebase.google.com/docs/ios/setup (Step 1, 2 and 3) for more detailed guide how to obtain Firebase configuration file for iOS.

### Step 5: Start the Metro Server

```bash
yarn start
```

### Step 6: Start the Application

From other terminal window, run Android:

```bash
yarn android
```

For iOS, do:

```bash
cd ios
pod install
```

Then open **RNVideoChat/ios/RNVideoChat.xcworkspace** in Xcode and run the project.


## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues).
