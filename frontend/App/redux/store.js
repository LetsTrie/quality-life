import { applyMiddleware, compose, createStore } from 'redux';
import { persistStore } from 'redux-persist';
import { thunk } from 'redux-thunk';
import rootReducer from './reducers';
const initialState = {};

const middleWare = [thunk];

export const store = createStore(
  rootReducer,
  initialState,
  compose(...[applyMiddleware(...middleWare)])
);

export const persistor = persistStore(store);
