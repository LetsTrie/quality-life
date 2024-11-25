import * as Keys from '../data/type';
import childCare from '../data/childCare';
import coronaProfile from '../data/coronaProfile';
import domesticViolence from '../data/domesticViolence';
import psychoticProfile from '../data/psychoticProfile';
import suicideIdeation from '../data/suicideIdeation';
import GHQ from '../data/scales/GHQ';
import PSS from '../data/scales/PSS';
import ANXIETY from '../data/scales/ANXIETY';

export function chooseTest(filename) {
  let data;
  switch (filename) {
    case Keys.CHILD_CARE:
      data = childCare;
      break;
    case Keys.CORONA_PROFILE:
      data = coronaProfile;
      break;
    case Keys.DOMESTIC_VIOLENCE:
      data = domesticViolence;
      break;
    case Keys.PSYCHOTIC_PROFILE:
      data = psychoticProfile;
      break;
    case Keys.SUICIDE_IDEATION:
      data = suicideIdeation;
      break;
    case Keys.GHQ:
      data = GHQ;
      break;
    case Keys.PSS:
      data = PSS;
      break;
    case Keys.ANXIETY:
      data = ANXIETY;
      break;
    default:
      break;
  }
  return data;
}
