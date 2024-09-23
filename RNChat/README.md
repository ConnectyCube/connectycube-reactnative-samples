# Chat sample code for React Native for ConnectyCube platform

This README introduces [ConnectyCube](https://connectycube.com) Chat sample code for React Native

Project contains the following features implemented:

- Session log-in and log-out;
- User registration;
- Connect to chat;
- Update user name, login, and avatar in profile;
- Search application users to create 1-1 or group chat;
- Create, update, delete group chat;
- Send and receive messages/images;
- Send and receive sent/delivered/read message statuses;
- Receive push notifications.

## Documentation

ConnectyCube React Native SDK getting started - [https://developers.connectycube.com/reactnative](https://developers.connectycube.com/reactnative)

ConnectyCube Chat API documentation - [https://developers.connectycube.com/reactnative/messaging](https://developers.connectycube.com/reactnative/messaging)

## Quick start and develop

Prepare environment for [React Native](https://reactnative.dev/docs/0.75/set-up-your-environment) and:

### Step 1: Clone the project

Clone the project:

```bash
# choose a folder on your computer to clone the "connectycube-reactnative-samples" repo
cd path/to/folder
# use git to clone
git clone https://github.com/ConnectyCube/connectycube-reactnative-samples.git
# navigate to React Native Chat sample project
cd connectycube-reactnative-samples/RNChat
```

### Step 2: Install _node_modules_

From RNChat project root:

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

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your the RNChat project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using Yarn
yarn android
```

### For iOS

Open _RNChat/ios/RNChat.xcworkspace_ in Xcode and select iOS device target or:

```bash
# using Yarn
yarn ios
```

## Configure Push Notification

ConnectyCube React Native Push Notification [guide](https://developers.connectycube.com/reactnative/push-notifications)

## Running on device

This project use React Native Notifications and it's recommended to test your app on an actual physical [Android](https://reactnative.dev/docs/running-on-device?platform=android)/[iOS](https://reactnative.dev/docs/running-on-device?platform=ios) devices.

## Build your own chat application

To make the sample works for your own app, please do the following:

1. Register new account and application at `https://admin.connectycube.com` and then put Application credentials from 'Overview' page into `src/config.js` file:

```javascript
export const appCredentials = {
  appId: 0,
  authKey: '***',
  authSecret: '***',
};
```

2. (Optional) If you are at [Enterprise](https://connectycube.com/pricing/) plan - provide your API server and Chat server endpoints at `src/config.js` file to point the sample against your own server:

```javascript
export const appConfig = {
  endpoints: {
    api: '***',
    chat: '***',
  },
};
```

4. Run on Android/iOS device

## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues).
