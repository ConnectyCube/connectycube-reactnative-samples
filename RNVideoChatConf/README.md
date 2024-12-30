# [ConnectyCube](https://connectycube.com) Conference calling sample for React Native

This README introduces [ConnectyCube](https://connectycube.com) Conference Calling code sample for React Native

Project contains the following features implemented:

- User authorization
- Video/audio conferencing calls
- Mute/unmute microphone
- Mute/unmute video
- Switch camera
- Screensharing
- Snack bars to notify users about changes

## Documentation

Getting Started - [https://developers.connectycube.com/reactnative](https://developers.connectycube.com/reactnative)

Conference Calling API documentation - [https://developers.connectycube.com/reactnative/videocalling-conference](https://developers.connectycube.com/reactnative/videocalling-conference)

## Screenshots

<kbd><img alt="React Native video chat code sample, login" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_login.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, select users" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_select_users.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, video chat" src="https://developers.connectycube.com/images/code_samples/reactnative/reactnative_codesample_video_video.PNG" width="200" /></kbd>

## Quick start

### Step 1: Clone the project

```bash
# use git to clone
git clone https://github.com/ConnectyCube/connectycube-reactnative-samples.git
# navigate to React Native Video Chat Conference sample project
cd connectycube-reactnative-samples/RNVideoChatConf
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

Also, create from 2 to 4 users in 'Users' module and put them into `src/config.js` file as well:

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

### Step 4: Start the Metro Server

```bash
yarn start
```

### Step 5: Start the Application

From other terminal window, run Android:

```bash
yarn android
```

For iOS, do:

```bash
cd ios
pod install
```

Then open **RNVideoChatConf/ios/RNVideoChatConf.xcworkspace** in Xcode and run the project.

## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues).
