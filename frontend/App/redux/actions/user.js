import {
  GET_PROFILE,
  UPDATE_PROFILE,
  UPDATE_MSM,
  UPDATE_MOJ,
  UPDATE_MCN,
  UPDATE_DN,
  UPDATE_SV,
  UPDATE_MHP,
} from './types';

export const storeUserProfile = (user) => (dispatch) => {
  dispatch({
    type: GET_PROFILE,
    payload: { ...user },
  });
};

export const updateProfileAction = (data) => (dispatch) => {
  dispatch({
    type: UPDATE_PROFILE,
    payload: { ...data },
  });
};

export const shownVideoAction = (videoUrl) => (dispatch) => {
  dispatch({
    type: UPDATE_SV,
    payload: videoUrl,
  });
};

export const mentalHeathProfileAction = (name) => (dispatch) => {
  dispatch({
    type: UPDATE_MHP,
    payload: name,
  });
};

export const updateMsmAction = (msm_score, msm_date) => (dispatch) => {
  dispatch({
    type: UPDATE_MSM,
    payload: { msm_score, msm_date },
  });
};

export const updateMojAction = (moj_score, moj_date) => (dispatch) => {
  dispatch({
    type: UPDATE_MOJ,
    payload: { moj_score, moj_date },
  });
};

export const updateMcnAction = (mcn_score, mcn_date) => (dispatch) => {
  dispatch({
    type: UPDATE_MCN,
    payload: { mcn_score, mcn_date },
  });
};

export const updateDnAction = (dn_score, dn_date) => (dispatch) => {
  dispatch({
    type: UPDATE_DN,
    payload: { dn_score, dn_date },
  });
};
