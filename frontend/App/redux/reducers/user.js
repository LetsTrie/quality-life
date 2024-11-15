import {
  GET_PROFILE,
  UPDATE_PROFILE,
  DELETE_PROFILE,
  UPDATE_MSM,
  UPDATE_MOJ,
  UPDATE_MCN,
  UPDATE_DN,
  UPDATE_MHP,
  UPDATE_SV,
} from '../actions/types';

const initialState = {
  name: null,
  age: null,
  gender: null,
  isMarried: null,
  address: null,
  email: null,
  msm_score: null,
  msm_date: null,
  moj_score: null,
  moj_date: null,
  mcn_score: null,
  mcn_date: null,
  dn_score: null,
  dn_date: null,
  isProfileCompleted: false,
  mentalHealthProfile: [],
  shownVideo: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_PROFILE:
      return {
        ...state,
        name: action.payload.name,
        age: action.payload.age,
        gender: action.payload.gender,
        isMarried: action.payload.isMarried,
        address: action.payload.address,
        email: action.payload.email,
        msm_score: action.payload.msm_score,
        msm_date: action.payload.msm_date,
        moj_score: action.payload.moj_score,
        moj_date: action.payload.moj_date,
        mcn_score: action.payload.mcn_score,
        mcn_date: action.payload.mcn_date,
        dn_score: action.payload.dn_score,
        dn_date: action.payload.dn_date,
        isProfileCompleted: action.payload.isProfileCompleted,
        mentalHealthProfile: action.payload.mentalHealthProfile,
        shownVideo: action.payload.shownVideo,
      };

    case UPDATE_SV:
      return {
        ...state,
        shownVideo: [...new Set([...state.shownVideo, action.payload])],
      };

    case UPDATE_MHP:
      return {
        ...state,
        mentalHealthProfile: [
          ...new Set([...state.mentalHealthProfile, action.payload]),
        ],
      };

    case UPDATE_MSM:
      return {
        ...state,
        msm_score: action.payload.msm_score,
        msm_date: action.payload.msm_date,
      };

    case UPDATE_MOJ:
      return {
        ...state,
        moj_score: action.payload.moj_score,
        moj_date: action.payload.moj_date,
      };
    case UPDATE_MCN:
      return {
        ...state,
        mcn_score: action.payload.mcn_score,
        mcn_date: action.payload.mcn_date,
      };
    case UPDATE_DN:
      return {
        ...state,
        dn_score: action.payload.dn_score,
        dn_date: action.payload.dn_date,
      };

    case DELETE_PROFILE:
      return { ...initialState };

    case UPDATE_PROFILE:
      return {
        ...state,
        name: action.payload.name,
        age: action.payload.age,
        gender: action.payload.gender,
        isMarried: action.payload.isMarried,
        address: action.payload.address,
        email: action.payload.email,
      };

    default:
      return state;
  }
}
