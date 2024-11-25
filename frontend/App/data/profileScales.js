import * as keyword from './type';

export default [
  {
    label: 'করোনা সম্পর্কিত তথ্য',
    scaleId: keyword.CORONA_PROFILE,
    redirectTo: keyword.SHOW_VIDEO,
    type: 'coronaProfile',

    link: keyword.CORONA_PROFILE,
  },
  {
    label: 'গুরুতর সমস্যা সম্পর্কিত তথ্য',
    scaleId: keyword.PSYCHOTIC_PROFILE,
    redirectTo: keyword.HELP_CENTER,
    type: 'psychoticProfile',

    link: keyword.PSYCHOTIC_PROFILE,
  },
  {
    label: 'আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য',
    scaleId: keyword.SUICIDE_IDEATION,
    redirectTo: keyword.HELP_CENTER,
    type: 'suicideIdeation',

    link: keyword.SUICIDE_IDEATION,
  },
  {
    label: 'পারিবারিক সহিংসতা সম্পর্কিত তথ্য',
    scaleId: keyword.DOMESTIC_VIOLENCE,
    redirectTo: keyword.HELP_CENTER,
    type: 'domesticViolence',

    link: keyword.DOMESTIC_VIOLENCE,
  },
  {
    label: 'সন্তান পালন সম্পর্কিত তথ্য',
    scaleId: keyword.CHILD_CARE,
    redirectTo: keyword.SHOW_VIDEO,
    type: 'childCare',

    link: keyword.CHILD_CARE,
  },
];
