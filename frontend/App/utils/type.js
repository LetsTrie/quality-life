export const TYPES = {
  APPOINTMENT_REQUESTED: 'APPOINTMENT_REQUESTED',
  REQUESTED: 'REQUESTED',
  APPOINTMENT_ACCEPTED: 'APPOINTMENT_ACCEPTED',
  SUGGEST_A_SCALE: 'SUGGEST_A_SCALE',
  SCALE_FILLUP_BY_USER: 'SCALE_FILLUP_BY_USER',
};

export const scaleTestNames = {
  coronaProfile: 'করোনা সম্পর্কিত তথ্য',
  psychoticProfile: 'গুরুতর সমস্যা সম্পর্কিত তথ্য',
  suicideIdeation: 'আত্মহত্যা পরিকল্পনা সম্পর্কিত তথ্য',
  domesticViolence: 'পারিবারিক সহিংসতা সম্পর্কিত তথ্য',
  childCare: 'সন্তান পালন সম্পর্কিত তথ্য',
  manoshikObosthaJachaikoron: 'মানসিক অবস্থা যাচাইকরণ',
  manoshikChapNirnoy: 'মানসিক চাপ নির্ণয়',
  duschintaNirnoy: 'দুশ্চিন্তা নির্ণয়',
  depression_scale: 'Depression Scale',
  'dhaka_university_obsessive_compulsive_scale_(duocs)':
    'Dhaka University Obsessive Compulsive Scale (DUOCS)',
  somatic_complaints_scale: 'Somatic Complaints Scale',
  'dhaka_university_cognitive_distortion_scale_(ducds)':
    'Dhaka University Cognitive Distortion Scale (DUCDS)',
  aggression_scale: 'Aggression Scale',
  satisfaction_with_life_scale: 'Satisfaction with life scale',
  'hopelessness_scale_(beck)': 'Hopelessness Scale (Beck)',
  social_interaction_anxiety_scale: 'Social Interaction Anxiety Scale',
  nicotine_addiction_scale: 'Nicotine Addiction Scale',
  social_avoidance_and_distress_scale: 'Social avoidance and distress scale',
};

export const typeLabelMap = (type) => {
  if (type in scaleTestNames) {
    return scaleTestNames[type];
  }

  return type;
};
