import * as T from '../data/type';
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
    case T.childCare:
      data = childCare;
      break;
    case T.coronaProfile:
      data = coronaProfile;
      break;
    case T.domesticViolence:
      data = domesticViolence;
      break;
    case T.psychoticProfile:
      data = psychoticProfile;
      break;
    case T.suicideIdeation:
      data = suicideIdeation;
      break;
    case T.GHQ:
      data = GHQ;
      break;
    case T.PSS:
      data = PSS;
      break;
    case T.ANXIETY:
      data = ANXIETY;
      break;
    default:
      break;
  }
  return data;
}
