import { combineReducers } from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';

import authReducer from './auth';
import userReducer from './user';
import profReducer from './prof';
import profNotiReducer from './prof_noti';
import profReqReducer from './prof_req';
import profClientReducer from './prof_client';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

export default combineReducers({
  auth: persistReducer(persistConfig, authReducer),
  user: persistReducer(persistConfig, userReducer),
  prof: persistReducer(persistConfig, profReducer),
  profNotifications: persistReducer(persistConfig, profNotiReducer),
  profRequests: persistReducer(persistConfig, profReqReducer),
  profClient: persistReducer(persistConfig, profClientReducer),
});
