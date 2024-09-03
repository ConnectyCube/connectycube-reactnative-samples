export const NO_ASNWER_TIMER = 30000; // 30 sec

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
  appId: 5,
  authKey: 'fESpBfG6KS4yhO7',
  authSecret: 'FEcQedvDA36U5nx',
};

export const appConfig = {
  debug: { mode: 1 },
  conference: { 'server': 'wss://janusdev.connectycube.com:8989' },
  endpoints: {
    api: 'apidev.connectycube.com',
    chat: 'chatdev.connectycube.com',
  },
};

export const users = [
  {
    id: 422,
    name: 'Alice',
    login: 'videouser1',
    password: 'videouser1',
    color: '#34ad86',
  },
  {
    id: 424,
    name: 'Bob',
    login: 'videouser2',
    password: 'videouser2',
    color: '#077988',
  },
  {
    id: 425,
    name: 'Ciri',
    login: 'videouser3',
    password: 'videouser3',
    color: '#13aaae',
  },
  {
    id: 426,
    name: 'Dexter',
    login: 'videouser4',
    password: 'videouser4',
    color: '#056a96',
  },
];
