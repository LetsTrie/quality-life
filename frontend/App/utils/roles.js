import constants from '../navigation/constants';

export const RoleEnum = {
  ADMIN: 'ADMIN',
  USER: 'user',
  PROFESSIONAL: 'professional',
};

export const selectHomepageByRole = (page, role) => {
  if (page === constants.HOMEPAGE && role === RoleEnum.PROFESSIONAL) {
    return constants.PROF_HOMEPAGE;
  } else if (page === constants.PROF_HOMEPAGE && role === RoleEnum.USER) {
    return constants.HOMEPAGE;
  }
  return page;
};

export const isUser = (role) => role === RoleEnum.USER;
export const isProfessional = (role) => role === RoleEnum.PROFESSIONAL;
