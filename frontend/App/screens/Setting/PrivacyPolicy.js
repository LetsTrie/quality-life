import React from 'react';
import ShowContent from './ShowContent';
import { policy } from './content';
import constants from '../../navigation/constants';
import { useBackPress } from '../../hooks';

const SCREEN_NAME = constants.PRIVACY_POLICY;
const PrivacyPolicy = () => {
  useBackPress(SCREEN_NAME);

  return <ShowContent container={policy} />;
};

export default PrivacyPolicy;
