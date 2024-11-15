import * as T from './type';

export default [
  {
    label: 'করোনা সম্পর্কিত তথ্য',
    link: T.coronaProfile,
    redirectTo: T.SHOW_VIDEO,
    type: 'coronaProfile',
  },
  {
    label: 'গুরুতর সমস্যা সম্পর্কিত তথ্য',
    link: T.psychoticProfile,
    redirectTo: T.HELP_CENTER,
    type: 'psychoticProfile',
  },
  {
    label: 'আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য',
    link: T.suicideIdeation,
    redirectTo: T.HELP_CENTER,
    type: 'suicideIdeation',
  },
  {
    label: 'পারিবারিক সহিংসতা সম্পর্কিত তথ্য',
    link: T.domesticViolence,
    redirectTo: T.HELP_CENTER,
    type: 'domesticViolence',
  },
  {
    label: 'সন্তান পালন সম্পর্কিত তথ্য',
    link: T.childCare,
    redirectTo: T.SHOW_VIDEO,
    type: 'childCare',
  },
];
