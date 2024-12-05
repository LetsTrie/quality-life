import { combineReducers } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

import authReducer from './auth';
import userReducer from './user';
import profReducer from './prof';
import notificationReducer from './notifications';
import profReqReducer from './prof_req';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

export default combineReducers({
  auth: persistReducer(persistConfig, authReducer),
  user: persistReducer(persistConfig, userReducer),
  prof: persistReducer(persistConfig, profReducer),
  notifications: persistReducer(persistConfig, notificationReducer),
  profRequests: persistReducer(persistConfig, profReqReducer),
});
