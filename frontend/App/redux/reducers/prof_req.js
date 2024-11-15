import {
  PROF_REQUEST_ADD,
  PROF_REQUEST_REMOVE,
  PROF_REQUEST_SEEN,
  DELETE_ALL_PROF_REQUEST,
} from '../actions/types';

const initialState = {
  requests: [],
};

export default function (state = initialState, action) {
  let id, index;
  switch (action.type) {
    case PROF_REQUEST_ADD:
      return {
        requests: [...(state.requests ?? []), ...action.payload.requests],
      };

    case DELETE_ALL_PROF_REQUEST:
      return { 
        ...initialState 
      };

    case PROF_REQUEST_REMOVE:
      id = action.payload._id;
      index = state.requests.findIndex((n) => n._id === id);
      return {
        requests: [
          ...state.requests.slice(0, index),
          ...state.requests.slice(index + 1),
        ],
      };

    case PROF_REQUEST_SEEN:
      id = action.payload._id;
      index = state.requests.findIndex((n) => n._id === id);
      let newRequests = state.requests;
      newRequests[index].hasProfViewed= true;
      return { requests: [...newRequests] };

    default:
      return state;
  }
}
