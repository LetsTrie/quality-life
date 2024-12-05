import {
  SET_PROFESSIONAL_INFO,
  PROF_SIGN_OUT,
  NEW_NOTIFICATION_COUNT,
  NEW_NOTIFICATION_COUNT_MINUS,
  UPDATE_PROFILE_PROF,
} from '../actions/types';

const initialState = {
  _id: null,
  prof: null,
  numOfNewNotifications: 0,
  numOfNewClientRequests: 0,
  name: null,
  email: null,
  profession: null,
  designation: null,
  eduQualification: null,
  experience: null,
  fee: null,
  step: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_PROFESSIONAL_INFO:
      return {
        ...state,
        prof: action.payload.prof,

        _id: action.payload._id,
        name: action.payload.prof.name,
        email: action.payload.prof.email,
        profession: action.payload.prof.profession,
        designation: action.payload.prof.designation,
        eduQualification: action.payload.prof.eduQualification,
        experience: action.payload.prof.experience,
        fee: action.payload.prof.fee,

        step: action.payload.prof.step,
      };

    case PROF_SIGN_OUT:
      return { ...initialState };

    case NEW_NOTIFICATION_COUNT:
      return {
        ...state,
        numOfNewClientRequests: action.payload.numOfNewClientRequests,
      };

    case NEW_NOTIFICATION_COUNT_MINUS:
      return {
        ...state,
        numOfNewNotifications:
          action.payload.noti_type === 'APPOINTMENT_REQUESTED'
            ? state.numOfNewNotifications - 1
            : state.numOfNewNotifications,

        numOfNewClientRequests:
          action.payload.noti_type === 'APPOINTMENT_REQUESTED'
            ? state.numOfNewClientRequests - 1
            : state.numOfNewClientRequests,
      };
    case UPDATE_PROFILE_PROF:
      return {
        ...state,
        prof: action.payload,
        name: action.payload.name,
        profession: action.payload.profession,
        designation: action.payload.designation,
        eduQualification: action.payload.eduQualification,
        experience: action.payload.experience,
        fee: action.payload.fee,
      };

    default:
      return state;
  }
}
