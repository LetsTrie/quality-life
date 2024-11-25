import * as Key from './type';

export default [
  {
    place: 'জাতীয় মানসিক স্বাস্থ্য ইনস্টিউট ও হাসপাতাল',
    keywords: [Key.PSYCHOTIC_PROFILE, Key.SUICIDE_IDEATION],
    contacts: [
      {
        number: '01404000080',
        time: 'সকাল ৮ টা থেকে ১০ টা',
        type: 'phone',
      },
      {
        number: '01404000081',
        time: 'সকাল ৮ টা থেকে ১০ টা',
        type: 'phone',
      },
      {
        number: '01404000082',
        time: 'সকাল ৮ টা থেকে ১০ টা (WhatsApp)',
        type: 'whatsapp',
      },
      {
        number: '01404000083',
        time: 'সকাল ৮ টা থেকে ১০ টা (WhatsApp)',
        type: 'whatsapp',
      },
    ],
  },
  {
    place: 'নাসিরুল্লাহ সাইকথেরাপি ইউনিট',
    location: 'ঢাকা বিশ্ববিদ্যালয়',
    keywords: [Key.PSYCHOTIC_PROFILE, Key.SUICIDE_IDEATION],
    contacts: [
      {
        number: '01715654538',
        type: 'phone',
      },
    ],
  },
  {
    place: 'আইন ও সালিশ কেন্দ্র হেল্পলাইন নাম্বার',
    keywords: [Key.DOMESTIC_VIOLENCE],
    contacts: [
      {
        number: '01724415677',
        type: 'phone',
        time: 'সকাল ৯ টা থেকে ৫ টা',
        hasToll: false,
      },
    ],
  },
  {
    place: 'মহিলা ও শিশু বিষয়ক মন্ত্রণালয়',
    keywords: [Key.DOMESTIC_VIOLENCE],
    contacts: [
      {
        number: '109',
        type: 'phone',
        hasToll: true,
      },
    ],
  },
];
