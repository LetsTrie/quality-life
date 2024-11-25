import {
  ADD_ALL_REQUESTED_CLIENT,
  REMOVE_ONE_REQUESTED_CLIENT,
  ADD_ALL_MY_CLIENT,
  ADD_ONE_MY_CLIENT,
  DELETE_ALL_CLIENT_REQUEST,
} from '../actions/types';

const initialState = {
  clients: [],
  reqClients: [],
};

export default function (state = initialState, action) {
  let id, index;
  switch (action.type) {
    case ADD_ALL_REQUESTED_CLIENT:
      return {
        ...state,
        reqClients: action.payload.reqClients,
      };

    case DELETE_ALL_CLIENT_REQUEST:
      return {
        ...initialState,
      };

    case REMOVE_ONE_REQUESTED_CLIENT:
      id = action.payload._id;
      index = state.reqClients.findIndex((n) => n._id === id);
      return {
        ...state,
        reqClients: [...state.reqClients.slice(0, index), ...state.reqClients.slice(index + 1)],
      };

    case ADD_ALL_MY_CLIENT:
      return {
        ...state,
        clients: action.payload.clients,
      };

    case ADD_ONE_MY_CLIENT:
      return {
        ...state,
        clients: [action.payload.client, ...state.clients],
      };

    default:
      return state;
  }
}
