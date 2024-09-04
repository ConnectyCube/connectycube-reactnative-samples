# Conference calling code sample for React Native for ConnectyCube platform

This README introduces [ConnectyCube](https://connectycube.com) Conference Calling code sample for React Native

Project contains the following features implemented:

- User authorization
- Video calls up to 4 users
- Mute/unmute microphone
- Mute/unmute video
- Switch camera
- Snack bars to notify users about changes

## Documentation

ConnectyCube React Native SDK getting started - [https://developers.connectycube.com/reactnative](https://developers.connectycube.com/reactnative)

ConnectyCube Conference Calling API documentation - [https://developers.connectycube.com/reactnative/videocalling-conference](https://developers.connectycube.com/reactnative/videocalling-conference)

## Screenshots

<kbd><img alt="React Native video chat code sample, login" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_login.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, select users" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_select_users.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, video chat" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_video.PNG" width="200" /></kbd>

## Quick start and develop

Prepare environment for [React Native](https://reactnative.dev/docs/0.75/set-up-your-environment) and:

### Step 1: Clone the project

Clone the project:

```bash
# choose a folder on your computer to clone the "connectycube-reactnative-samples" repo
cd path/to/folder
# use git to clone
git clone https://github.com/ConnectyCube/connectycube-reactnative-samples.git
# navigate to React Native Video Chat Conference sample project
cd RNVideoChatConf
```

### Step 2: Install _node_modules_

From RNVideoChatConf project root:

```bash
yarn install
```

### Step 3: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.
To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using Yarn
yarn start
```

### Step 4: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your the RNVideoChatConf project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using Yarn
yarn android
```

### For iOS

Open _RNVideoChatConf/ios/RNVideoChatConf.xcworkspace_ in Xcode and select iOS device target or:

```bash
# using Yarn
yarn ios
```

## Running on device

This project use React Native WebRTC and it's highly recommended to test your app on an actual physical [Android](https://reactnative.dev/docs/running-on-device?platform=android)/[iOS](https://reactnative.dev/docs/running-on-device?platform=ios) devices.

## Build your own video chat conference application

To make the sample works for your own app, please do the following:

1. Register new account and application at `https://admin.connectycube.com` and then put Application credentials from 'Overview' page into `src/config.js` file:

```javascript
export const credentials = {
  appId: 0,
  authKey: '***',
  authSecret: '***',
};
```

2. At `https://admin.connectycube.com`, create from 2 to 4 users in 'Users' module and put them into `src/config.js` file:

```javascript
export const users = [
  {
    id: 10001,
    name: 'User1',
    login: 'videouser1',
    password: 'videouser1',
    color: '#34ad86',
  },
  {
    id: 10002,
    name: 'User2',
    login: 'videouser2',
    password: 'videouser2',
    color: '#077988',
  },
  {
    id: 10003,
    name: 'User3',
    login: 'videouser3',
    password: 'videouser3',
    color: '#13aaae',
  },
  {
    id: 10004,
    name: 'User4',
    login: 'videouser4',
    password: 'videouser4',
    color: '#056a96',
  },
];
```

3. (Optional) If you are at [Enterprise](https://connectycube.com/pricing/) plan - provide your API server and Chat server endpoints at `src/config.js` file to point the sample against your own server:

   ```javascript
   {
      endpoints: {
          api: "***",
          chat: "***"
      },
      ...
   };
   ```

4. Run on Android/iOS device

## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues) - we will create the sample for you. For FREE!
