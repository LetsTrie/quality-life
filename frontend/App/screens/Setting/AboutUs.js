import React from 'react';
import { aboutUs } from './content';
import ShowContent from './ShowContent';
import constants from '../../navigation/constants';
import { useBackPress } from '../../hooks';

const SCREEN_NAME = constants.ABOUT_US;
const AboutUs = () => {
  useBackPress(SCREEN_NAME);

  return <ShowContent container={aboutUs} />;
};

export default AboutUs;
