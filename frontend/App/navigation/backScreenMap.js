import constants from './constants';

export default {
  [constants.PROFESSIONALS_LIST]: constants.HOMEPAGE,
  [constants.PROFESSIONAL_DETAILS]: constants.PROFESSIONALS_LIST,
  [constants.APPOINTMENT_STATUS]: constants.PROFESSIONALS_LIST,

  [constants.VIDEO_SCREEN]: constants.PROFILE,
  [constants.VIDEO_EXERCISE_LIST]: constants.HOMEPAGE,
  [constants.VIDEO_EXERCISE]: constants.VIDEO_EXERCISE_LIST,
  [constants.THREE_SCALES]: constants.HOMEPAGE,
  [constants.UPDATE_USER_PROFILE]: constants.PROFILE,
  [constants.PROFILE]: constants.HOMEPAGE,
  [constants.LOGIN]: constants.WELCOME,
  [constants.REGISTER]: constants.WELCOME,
  [constants.WAIT_FOR_VERIFICATION]: constants.WELCOME,
  [constants.PROF_REGISTER_STEP_1]: constants.PROF_REGISTRATION_CONSENT,
  [constants.PROF_REGISTER_STEP_2]: constants.SPECIAL_LOGOUT_ACTION,
  [constants.PROF_REGISTER_STEP_3]: constants.SPECIAL_LOGOUT_ACTION,
  [constants.PROF_REGISTER_STEP_4]: constants.SPECIAL_LOGOUT_ACTION,
  [constants.PROF_HOMEPAGE]: constants.WELCOME,
  [constants.PROF_LOGIN]: constants.WELCOME,

  [constants.PROF_PROFILE]: constants.PROF_HOMEPAGE,
  [constants.PROF_UPDATE_PROFILE]: constants.PROF_PROFILE,
  [constants.PROF_ASSESSMENT_TOOLS]: constants.PROF_HOMEPAGE,
  [constants.PROF_ASSESSMENT_TOOL_DETAILS]: constants.PROF_ASSESSMENT_TOOLS,
  [constants.PROF_CLIENT_REQUEST]: constants.PROF_HOMEPAGE,
  [constants.PROF_RESPONSE_CLIENT_REQUEST]: constants.PROF_HOMEPAGE,
  [constants.PROFESSIONALS_CLIENT]: constants.PROF_HOMEPAGE,
  [constants.CLIENT_PROFILE]: constants.PROFESSIONALS_CLIENT,

  [constants.USER_APPOINTMENT_TAKEN]: constants.HOMEPAGE,
};
