export const NO_ANSWER_TIMER = 30000; // 30 sec

export const messages = {
  login:
    'Login as any user on this computer and another user on another computer.',
  create_session: 'Creating a session...',
  connect: 'Connecting...',
  connect_error:
    'Something went wrong with the connection. Check internet connection or user info and try again.',
  login_as: 'Logged in as ',
  title_login: 'Choose a user to login with:',
  title_callee: 'Choose users to call:',
  calling: 'Calling...',
  webrtc_not_avaible: 'WebRTC is not available in your browser',
  no_internet: 'Please check your Internet connection and try again',
};

export const credentials = {
  appId: 385,
  authKey: 'DFBMs5-dKBBCXcd',
  authSecret: 'SkCW-ThdnmRg9Za',
};

export const appConfig = {
  debug: { mode: 1 },
  conference: { server: 'wss://janus.connectycube.com:8989' },
};

export const users = [
  {
    id: 72780,
    name: 'Alice',
    login: 'videouser1',
    password: 'videouser1',
    color: '#34ad86',
  },
  {
    id: 72781,
    name: 'Bob',
    login: 'videouser2',
    password: 'videouser2',
    color: '#077988',
  },
  {
    id: 590565,
    name: 'Ciri',
    login: 'videouser3',
    password: 'videouser3',
    color: '#13aaae',
  },
  {
    id: 590583,
    name: 'Dexter',
    login: 'videouser4',
    password: 'videouser4',
    color: '#056a96',
  },
];
