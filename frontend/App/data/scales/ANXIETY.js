const getAnswers = (weights) => [
  {
    label: 'একেবারেই হয় না',
    value: 1,
    weight: weights[0],
  },
  {
    label: 'খুব সামান্য হয়',
    value: 2,
    weight: weights[1],
  },
  {
    label: 'মোটামুটি হয়',
    value: 3,
    weight: weights[2],
  },
  {
    label: 'বেশী হয়',
    value: 4,
    weight: weights[3],
  },
  {
    label: 'অনেক বেশী',
    value: 5,
    weight: weights[4],
  },
];

export default {
  questions: [
    {
      question: 'গত এক মাসে আমার ঘনঘন শ্বাস পড়ে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার দমবন্ধবোধ হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার বুক ভার ভার লাগে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার বুক ধড়ফড় করে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি বুকে ব্যাথা অনুভব করে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার গা/হাত-পা শিরশির করে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার হাত/পা কাঁপে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার হাত/পা অবশ লাগে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার হাত/পা জ্বালাপোড়া করে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার মাথা ঝিমঝিম করে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার মাথা ঘোরে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার মাথা  ব্যাথা করে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার মাথা থেকে গরম ভাব ওঠে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার গলা শুঁকিয়ে যায় ও পিপাসা লাগে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি অসুস্থ হয়ে যাবো এমন মনে হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি আমার স্বাস্থ্য নিয়ে চিন্তিত থাকি',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি দুর্বলবোধ করি',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার হজমে অসুবিধা হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার পেটে অস্বস্থি লাগে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার বমি বমি লাগে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার খুব ঘাম হয় (গরমের জন্য নয়)',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি আরাম করতে পারি না',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার সামাজিক পরিবেশে কথা বলতে অসুবিধা হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে এক বিষয় নিয়ে আমার বারবার চিন্তা হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার খুব খারাপ কিছু ঘটবে বলে আশংকা হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি প্রায়ই দুঃশ্চিন্তাগ্রস্থ থাকি',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি প্রায়ই চমকে উঠি',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি বিচলিত ও সন্ত্রস্তবোধ করি',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার আত্মনিয়ন্ত্রন হারাবার ভয় হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question:
        'গত এক মাসে আমি এত নার্ভাস বা উত্তেজিত বোধ করি যে মনে হয় আমার সবকিছু এলোমেলো হয়ে যাচ্ছে',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি ধৈর্য ধরতে পারি না',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমি সিদ্ধান্তহীনতায় ভুগি',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার আত্মবিশ্বাসের অভাববোধ হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে একটা বিষয়ের প্রতি মনোযোগ দিয়ে রাখা আমার জন্য বেশ কষ্টকর',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার মনে হয় আমি এখনই মারা যাচ্ছি',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
    {
      question: 'গত এক মাসে আমার মৃত্যু ভয় হয়',
      options: getAnswers([0, 1, 2, 3, 4]),
    },
  ],
};
