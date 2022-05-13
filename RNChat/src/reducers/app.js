import {
  APP_LOADING,
} from '../actions/app'

export default (appIsLoading = true, action) => {
  switch (action.type) {
    case APP_LOADING:
      return action.appIsLoading;

    default:
      return appIsLoading
  }
}