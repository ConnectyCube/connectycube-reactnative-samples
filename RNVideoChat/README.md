# Video Chat code sample for React Native for ConnectyCube platform

This README introduces [ConnectyCube](https://connectycube.com) Video Chat code sample for React Native

Project contains the following features implemented:

- User authorization
- Group video calls (up to 4 users)
- Mute/unmute microphone
- Switch cameras

## Documentation

ConnectyCube React Native getting started - [https://developers.connectycube.com/reactnative](https://developers.connectycube.com/reactnative)

ConnectyCube Video Chat API documentation - [https://developers.connectycube.com/reactnative/videocalling](https://developers.connectycube.com/reactnative/videocalling)

## Screenshots

<kbd><img alt="React Native video chat code sample, login" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_video_login.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, select users" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_video_select_users.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, video chat" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_video_video.PNG" width="200" /></kbd>

## Roadmap

- Push notifications on incoming call
- Call Kit

## Quick start and develop

Quick start [React Native](https://facebook.github.io/react-native/docs/getting-started.html) app.

Prepare environment for React Native and:

1. Clone the project;
2. Install node_modules: `cd connectycube-reactnative-samples/RNVideoChat && npm install`;
3. Run `npm run ios` or `npm run android`.

## Running on a device

The above command will automatically run your app on the iOS Simulator by default. If you want to run the app on an actual physical iOS device, please follow the instructions [here](https://facebook.github.io/react-native/docs/running-on-device).

## Build your own VideoChat app

To make the sample works for your own app, please do the following:

1.  Register new account and application at `https://admin.connectycube.com` and then put Application credentials from 'Overview' page into `src/config.js` file:

    ```javascript
    export const credentials = {
      appId: 0,
      authKey: "",
      authSecret: ""
    };
    ```

2.  At `https://admin.connectycube.com`, create from 2 to 4 users in 'Users' module and put them into `src/config.js` file:

    ```javascript
    export const users = [
      {
        id: 1,
        name: "User1",
        login: "videouser1",
        password: "videouser1",
        color: "#34ad86"
      },
      {
        id: 2,
        name: "User2",
        login: "videouser2",
        password: "videouser2",
        color: "#077988"
      },
      {
        id: 3,
        name: "User3",
        login: "videouser3",
        password: "videouser3",
        color: "#13aaae"
      },
      {
        id: 4,
        name: "User4",
        login: "videouser4",
        password: "videouser4",
        color: "#056a96"
      }
    ];
    ```

3.  (Optional) If you are at [Enterprise](https://connectycube.com/pricing/) plan - provide your API server and Chat server endpoints at `src/config.js` file to point the sample against your own server:

    ```javascript
    {
       endpoints: {
           api: "",
           chat: ""
       },
       ...
    };
    ```

4. Install node modules - `npm install`
5. Run `npm run ios` or `npm run android`.

## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues) - we will create the sample for you. For FREE!
