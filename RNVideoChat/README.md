# Video Chat code sample for React Native for ConnectyCube platform

This README introduces [ConnectyCube](https://connectycube.com) Video Chat code sample for React Native

Project contains the following features implemented:

- User authorization
- Group video calls (up to 4 users)
- Mute/unmute microphone
- Switch cameras
- CallKit

## Documentation

ConnectyCube React Native getting started - [https://developers.connectycube.com/reactnative](https://developers.connectycube.com/reactnative)

ConnectyCube Video Chat API documentation - [https://developers.connectycube.com/reactnative/videocalling](https://developers.connectycube.com/reactnative/videocalling)

## Screenshots

<kbd><img alt="React Native video chat code sample, login" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_video_login.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, select users" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_video_select_users.PNG" width="200" /></kbd> <kbd><img alt="React Native video chat code sample, video chat" src="https://developers.connectycube.com/docs/_images/code_samples/reactnative/reactnative_codesample_video_video.PNG" width="200" /></kbd>

## Getting started

To make the sample works for your own app, please do the following:

1. Clone the project
2. Install node_modules: `cd RNVideoChat && yarn`;
3. Register new account and application at `https://admin.connectycube.com` and then put Application credentials from 'Overview' page into `connectycube_config.json` file, like this:

    ```javascript
    {
      "name": "RNVideoChat",
      "displayName": "RNVideoChat",
      "senderID": "147299227261",
      "connectyCubeConfig": [
        {
          "appId": 385,
          "authKey": "DFBMs5-dKBBCXcd",
          "authSecret": "SkCW-ThdnmRg9Za"
        },
        { 
          "chat": {
            "streamManagement": {
              "enable": true
            }
          },
          "debug": {
            "mode": 1
          }
        }
      ]
    }
    ```

4. At `https://admin.connectycube.com`, create from 2 to 4 users in 'Users' module and put them into `src/config-users.js` file, like this:

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

(Optional) If you are at [Enterprise](https://connectycube.com/pricing/) plan - provide your API server and Chat server endpoints in `connectycube_config.json` file to point the sample against your own server:

    ```javascript
    { 
      "chat": {
        "streamManagement": {
          "enable": true
        }
      },
      "debug": {
        "mode": 1
      },
      "endpoints": {
        "api": "",
        "chat": ""
      },
    }
    ```

5. In order to use push notifications on Android, you need to create `google-services.json` file and copy it into project's `android/app` folder. Also, you need to update the `applicationId` in `android/app/build.gradle` to the one which is specified in `google-services.json`, so they must match. If you have no existing API project yet, the easiest way to go about in creating one is using this [step-by-step installation process](https://firebase.google.com/docs/android/setup`)

6. In order for push notifications to work properly - it requires to do create a key/certificate and upload to ConnectyCube Admin panel. The complete guide is available here `https://developers.connectycube.com/reactnative/push-notifications`

7. Run `yarn ios` or `yarn android`.

## Can't build yourself?

Got troubles with building React Native code sample? Just create an issue at [Issues page](https://github.com/ConnectyCube/connectycube-reactnative-samples/issues) - we will create the sample for you. For FREE!