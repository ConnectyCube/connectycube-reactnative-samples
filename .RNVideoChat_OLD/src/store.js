// import { configureStore } from '@reduxjs/toolkit';

import { createStore } from 'redux'

import rootReducer from './reducers'

// export const store = configureStore({
//   reducer: {
//     message: messageReducer
//   }
// });

const store = createStore(rootReducer)

export default store