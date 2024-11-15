import {
  ADD_ALL_REQUESTED_CLIENT,
  REMOVE_ONE_REQUESTED_CLIENT,
  ADD_ALL_MY_CLIENT,
  ADD_ONE_MY_CLIENT,
} from './types';

export const addAllRequestedClient = (reqClients) => (dispatch) => {
  dispatch({
    type: ADD_ALL_REQUESTED_CLIENT,
    payload: { reqClients },
  });
};

export const removeOneRequestedClient = (_id) => (dispatch) => {
  dispatch({
    type: REMOVE_ONE_REQUESTED_CLIENT,
    payload: { _id },
  });
};

export const addAllMyClient = (clients) => (dispatch) => {
  dispatch({
    type: ADD_ALL_MY_CLIENT,
    payload: { clients },
  });
};

export const addOneMyClient = (client) => (dispatch) => {
  dispatch({
    type: ADD_ONE_MY_CLIENT,
    payload: { client },
  });
};
