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
  authKey: 'zzzxxxccc'
};
```

### Step 4: Start the Metro Server

```bash
yarn start
```

### Step 5: Start the Application

Run Android: 

```bash
yarn android
```

For iOS, open **RNChat/ios/RNChat.xcworkspace** in Xcode and select iOS device target or do:

```bash
yarn ios
```

## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues).
