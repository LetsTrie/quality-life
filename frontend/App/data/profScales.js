// *****************
/*
  General Structure

  [
    {
      id,
      name,
      needToEvaluate,
      ques: [
        {
          question,
          option: [
            {
              label, 
              value,
              weight,
            }
          ]
        }
      ],
      range: [
        {
          min,
          max,
          severity
        }
      ]
    }
  ]
*/
// *****************

export default [
  // Depression Scale
  {
    id: 'depression_scale',
    name: 'Depression Scale',
    needToEvaluate: true,
    copyright: "Developed by Zahir Uddin and Dr. Mahmudur Rahman",
    ques: [
      {
        question: 'আমার অশান্তি লাগে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'ইদানিং আমি মন মরা থাকি।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমার ভবিষ্যত অন্ধকার।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'ভবিষ্যতে আমার অবস্থা দিন দিন আরো খারাপ হবে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমার সব শেষ হয়ে গেছে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি মনে করি যে , জীবনটা বর্তমানে খুব বেশি কষ্টকর।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'বর্তমানে আমি অনুভব করি যে মানুষ হিসাবে আমি সম্পূর্ণ ব্যর্থ।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি কোথাও আনন্দ ফুর্তি পাই না।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'নিজেকে খুব ছোট মনে হয়।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'সবকিছুতে আমার আত্নবিশ্বাস কমে গেছে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমার মনে হয় মানুষ আমাকে করুণা করে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'জীবনটা অর্থহীন।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'প্রায়ই আমার কান্না পায়।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি প্রায়ই বিরক্ত বোধ করি।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি কোন কিছুতেই আগ্রহ পাই না।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি ইদানিং চিন্তা করতে ও সিদ্ধান্ত নিতে পারি না।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি আজকাল অনেক কিছুতেই মনোযোগ দিতে পারি না।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি আগের মতো মনে রাখতে পারি না।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি দুর্বল বোধ করি এবং অল্পতেই ক্লান্ত হয়ে পরি।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি এখন কম ঘুমাই।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমি এখন বেশি ঘুমাই।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমার মেজাজ খিটখিটে হয়ে গেছে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমার ক্ষুধা কমে গেছে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমার ক্ষুধা বেড়ে গেছে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question:
          'আমার ওজন কমে গেছে (ইচ্ছাকৃতভাবে ওজন নিয়ন্ত্রণের চেষ্টা করার ফলে নয়)।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'আমার মনে হয় যে আমার কাজকর্মের গতি কমে গেছে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'হাসির কোন ঘটনা ঘটলেও আমি আর হাসতে পারি না।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'যৌন বিষয়ে আমার আগ্রহ কমে গেছে।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'সামাজিক কাজকর্মে আগের মতো অংশগ্রহণ করতে পারি না।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
      {
        question: 'শিক্ষা বা পেশাগত কাজকর্ম আগের মতো করতে পারি না।',
        options: [
          { label: 'একেবারেই প্রযোজ্য নয়', value: 1, weight: 1 },
          { label: 'প্রযোজ্য নয়', value: 2, weight: 2 },
          { label: 'মাঝামাঝি', value: 3, weight: 3 },
          { label: 'কিছুটা প্রযোজ্য', value: 4, weight: 4 },
          { label: 'পুরোপুরি প্রযোজ্য', value: 5, weight: 5 },
        ],
      },
    ],
    range: [
      { min: 30, max: 93, severity: 'Minimal' },
      { min: 94, max: 100, severity: 'Depressed' },
      { min: 101, max: 114, severity: 'Mild' },
      { min: 115, max: 123, severity: 'Moderate' },
      { min: 124, max: 150, severity: 'Severe' },
    ],
  },
  // Dhaka University Obsessive Compulsive Scale (DUOCS)
  {
    id: 'dhaka_university_obsessive_compulsive_scale_(duocs)',
    name: 'Dhaka University Obsessive Compulsive Scale (DUOCS)',
    needToEvaluate: true,
    copyright: "Developed by: Md. Kamruzzaman Mozumder and Dr. Roquia Begum",
    ques: [
      {
        question:
          'আমার মাথায় ধর্ম নিয়ে নানান ধরনের অদ্ভূত এবং বাজে চিন্তা আসে যা আমি চাইলেও থামাতে পারি না।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'পবিত্র স্থানকে  অপবিত্র করছি এমন কল্পনা বা ছবি আসে মনে, আমি চাইলেও তা মন থেকে সরাতে পারি না।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'নাস্তিকবাদী চিন্তা আমার মনের মধ্যে এত বারবার আসতে থাকে যে মনে হয় আমার ঈমান (সৃষ্টিকর্তার প্রতি বিশ্বাস) নষ্ট হয়ে গেছে।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'সারাক্ষণ সন্দেহ হয় আমি বুঝিনা নাপাক, নোংরা বা অশুচি হয়ে গেছি।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সারাক্ষণ মনে হয় আমার গায়ে হাতে ময়লা বা জীবাণু লেগে আছে।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'কোন কিছু পরিষ্কার করার সময় অনেকবার বা অনেক সময় লাগিয়ে  ধুই, যদিও বুঝি এতবার ধোয়ার দরকার নেই,  কিন্তু না ধুয়ে পারি না।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'পরিষ্কার পরিচ্ছন্নতার জন্য আমাকে প্রচুর পরিমাণ সাবান বা ডিটারজেন্ট পাউডার ব্যবহার করতে হয়।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'যেখানে নোংরা থাকতে পারে ওইসব স্থান সম্পর্কে আমি অতিরিক্ত সচেতন থাকি এবং প্রায়শই এড়িয়ে চলি।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমার গায়ে  কারো স্পর্শ লাগলে আমি গোসল বা পরিস্কার না হওয়া পর্যন্ত অশান্তিতে ভুগতে থাকি।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question: 'গোসল করতে আমার প্রচুর সময় এমনকি কয়েক ঘন্টাও লেগে যায়।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'কোন কাজ করার মাঝে আমার যদি মনে চিন্তা আসে নাপাক হয়ে  গেছি, তাহলে আমি তৎক্ষণাৎ আমি গোসলে যাই বা পরিচ্ছন্ন হতে চাই।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question: 'বিভিন্ন জিনিস আমি বারবার পরীক্ষা করে দেখি।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'নামাজ/ উপাসনা করতে গেলে সন্দেহ লাগে হয়তো সূরা/ শ্লোক ঠিকমত পড়া হয়নি, তখন আবার পড়ি, এভাবে অনেক সময় লেগে যায়।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'হিসাব করতে আমার খুব অসুবিধা হয়, শুধু মনে হয় বুঝি গোনায় ভুল হয়ে গেল।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমার মনের মতো না হওয়া পর্যন্ত আমি একই কাজ বারবার করতে থাকে।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question: 'বিভিন্ন জিনিস আমি একটি নির্দিষ্ট সংখ্যক বার করি।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'প্রাত্যহিক কাজ করতে আমার প্রচুর সময় লাগে বা প্রায় কোন কাজই সময় মত করতে পারি না।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'কোন কাজ করার সময় যদি আমার নির্ধারিত ধারাবাহিকতায় কোন ছেদ পড়ে বা বিঘ্ন ঘটে তবে সে কাজটি আমাকে আবার প্রথম থেকে শুরু করতে হয়।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমি বুঝি আমি এমন কিছু আচরণ করি যা অতিরিক্ত এবং অপ্রজনীয়, কিন্তু তারপরও না করে পারি না।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'কিছু কিছু ব্যাপার নিয়ে আমি অতিরিক্ত খুঁতখুঁতে বলে অন্যরা প্রায়ই আমার উপর বিরক্ত হয়।',
        options: [
          { label: 'একেবারেই নেই', value: 0, weight: 0 },
          { label: 'খুবই সামান্য', value: 1, weight: 1 },
          { label: 'সামান্য', value: 2, weight: 2 },
          { label: 'একটু বেশি', value: 3, weight: 3 },
          { label: 'অনেক বেশি', value: 4, weight: 4 },
        ],
      },
    ],
    range: [
      { min: 0, max: 17, severity: 'Cut-off Score' },
      { min: 18, max: 23, severity: 'Mild' },
      { min: 24, max: 40, severity: 'Moderate' },
      { min: 41, max: 49, severity: 'Severe' },
      { min: 50, max: 80, severity: 'Profound' },
    ],
  },
  // Somatic Complaints Scale
  {
    id: 'somatic_complaints_scale',
    name: 'Somatic Complaints Scale',
    needToEvaluate: true,
    copyright: "Adapted by Hasina Khatun and M Anisur Rahman",
    ques: [
      {
        question: 'আমার স্বাস্থ্যগত অবস্থা আমার কাজকর্ম সীমিত করে দিয়েছে।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমার এমন অসুস্থতা রয়েছে যা ডাক্তাররা ধরতে পারছেন না।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question:
          'আমার শরীরের কোনো কোনো অংশে আমি অবশ বোধ করি যা আমি বোঝাতে পারি না।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'কখনো কখনো আমি একই জিনিস দুটো করে দেখি বা ঝাপসা দেখি।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question:
          'কখনো কখনো আমার দৃষ্টিশক্তি খারাপ হয়ে যায় আবার সেটা ভালও হয়ে যায়।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'মাঝেমাঝে আমার হাতে কোন বোধশক্তি থাকেনা।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'কখনো কখনো আমার পা দুটি এতই দুর্বল হয় যে আমি হাঁটতে পারিনা।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'মাঝেমাঝে আমার শরীরের কোন কোন অংশ অবশ হয়ে যায়।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'বেশীর ভাগ সময়ই আমি সুস্থ বোধ করিনা।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমি ভীষণ ব্যথা-বেদনায় ভুগি।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমার স্বাস্থ্য ভাল।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 3 },
          { label: 'কিছুটা সত্য', value: 1, weight: 2 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 1 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 0 },
        ],
      },
      {
        question: 'আমার শারীরিক অবস্থা নিয়ে আমি খুব কমই অভিযোগ করি।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 3 },
          { label: 'কিছুটা সত্য', value: 1, weight: 2 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 1 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 0 },
        ],
      },
      {
        question: 'আমার গুরুতর পিঠের ব্যথা আছে।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমার পাকস্থলী দুর্বল।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'বেশীরভাগ মানুষের তুলনায় আমার ঘনঘন মাথাব্যথা হয়।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমার ঘনঘন ডায়রিয়া হয়।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমি বছরের পর বছর অনেক ডাক্তার দেখিয়েছি।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমার স্বাস্থ্য সমস্যাগুলো খুব জটিল।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমার শারীরিক সমস্যাগুলো নিয়ে কাজকর্ম করা আমার জন্য কষ্টকর।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমার শারীরিক সমস্যাগুলোর চিকিৎসকরা সব সময় কঠিন বলে মনে করে।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question:
          'আমার যে ধরনের স্বাস্থ্য সমস্যা আছে তা বেশীরভাগ মানুষের মধ্যেই দেখা যায়।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 3 },
          { label: 'কিছুটা সত্য', value: 1, weight: 2 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 1 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 0 },
        ],
      },
      {
        question: 'আমার মধ্যে কিছু অস্বাভাবিক রোগ ও অসুস্থতা আছে।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
      {
        question: 'আমার বয়স অনুপাতে আমার স্বাস্থ্য খুবই ভালো।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 3 },
          { label: 'কিছুটা সত্য', value: 1, weight: 2 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 1 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 0 },
        ],
      },
      {
        question:
          'আমি মানুষের সাথে তাদের শারীরিক সমস্যা নিয়ে কথা বলতে পছন্দ করি।',
        options: [
          { label: 'একেবারে সত্য', value: 0, weight: 0 },
          { label: 'কিছুটা সত্য', value: 1, weight: 1 },
          { label: 'বেশির ভাগ সত্য', value: 2, weight: 2 },
          { label: 'পুরোপুরি সত্য', value: 3, weight: 3 },
        ],
      },
    ],
    range: [
      { min: 0, max: 28, severity: 'Cut-off Score' },
      { min: 29, max: 42, severity: 'Mild' },
      { min: 43, max: 50, severity: 'Moderate' },
      { min: 51, max: 55, severity: 'Severe' },
      { min: 56, max: 72, severity: 'Profound' },
    ],
  },
  // Dhaka University Cognitive Distortion Scale (DUCDS)
  {
    id: 'dhaka_university_cognitive_distortion_scale_(ducds)',
    name: 'Dhaka University Cognitive Distortion Scale (DUCDS)',
    needToEvaluate: true,
    copyright: "Developed by: Ummey Saima Siddika and Kamal Uddin Ahmed Chowdhury",
    ques: [
      {
        question: 'জীবনে আমি কিছুই অর্জন করিনি।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সবাইকে খুশি করতে না পারলে আমি সম্পূর্ণরূপে ব্যর্থ।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সফল হবার মত কোন যোগ্যতাই আমার নেই।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমি আমার প্রিয়জনদের  কোন স্বপ্নই পূরণ করতে পারি নাই।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'অন্যের সাথে সঠিক ভাবে কথা বলতে না পারা মানেই আমি অসামাজিক।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'কখনো যদি কাউকে আমি আঘাত দেই, তাহলে আমি দিনে দিনে সবার কাছে আরো খারাপ হয়ে যাবো।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সবাইকে আমার প্রতি আকৃষ্ট করতে না পারলে আমার জীবন অর্থহীন।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'জীবনে কখনো কোন সুযোগ থেকে বঞ্চিত হওয়া অর্থই আমি সব সময়ের জন্য অবহেলিত।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'পৃথিবীতে এমন কেউ নেই যে আমাকে বুঝে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সামাজিক সম্পর্কে শুধু অশান্তিই সৃষ্টি হয়।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'প্রিয়জনদের কাছে শুধু অবহেলাই পাই।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'মানুষ মাত্রই সুযোগ সন্ধানী।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'দুঃখই আমার জীবনের একমাত্র সঙ্গী।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'অন্যরা ভাবে যে, আমি কোন কাজ সঠিক ভাবে করতে পারি না।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'অন্যরা আমাকে বোকা ভাবে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সবাই আমার দুর্বলতার কথা জানে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'জীবনে আমার আর সুখ আসবে না।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সবাই ভাবে আমি ভীতু, কাপুরুষ।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'অশান্তি আমার সারা জীবনের সঙ্গী হয়ে থাকবে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'কোন চিকিৎসাই আমাকে সুস্থ করতে পারবে না।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'কেউই আমাকে নির্ভরযোগ্য মানুষ মনে করে না।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমাকে খুশী করার জন্যই সবসময় অন্যরা আমার প্রশংসা করে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমার মন বলে, আমি যেমনটা আশা করি তা কখনো হয় না।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমি যতই চেষ্টা করি না কেন কোন কাজের দায়িত্ব নিলে তা খারাপ হবেই।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'বন্ধুদের তুলনায় সর্বত্র আমার সফলতার চেয়ে ব্যর্থতাই বেশী।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'যদি আমার সমস্যা অন্যরা জেনে যায় তবে তা আমার জন্য ভীষণ লজ্জাজনক।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমাকে সব ক্ষেত্রেই নিখুঁত হতে হবে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমার পরিবারের উচিৎ আমার প্রতিটি অনুভূতিকে সঠিক ভাবে মূল্যায়ন করা।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমি যাদের ভালবাসি, তাদের সবার উচিৎ আমাকে ভালবাসা।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সব ক্ষেত্রে আমাকে বিচক্ষন হতে হবে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমার উচিৎ সবাইকে সন্তুষ্ট  করে চলা।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'অবশ্যই সর্বক্ষেত্রে আমাকে একজন সফল মানুষ হতে হবে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমাকে উচ্চ পদমর্যাদা অর্জন করতেই হবে।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমার কোন ভুলই করা উচিৎ না।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'অন্যদের সাথে আমার সম্পর্ক থাকে না কারন আমি ভালো সম্পর্ক ধরে রাখতে পারি না।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমার জীবন নষ্টের কারন আমি নিজেই।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমার পাপের শাস্তি হিসেবেই সৃষ্টিকর্তা আমাকে কষ্ট দিয়েছেন।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমার কারনেই আমার আপনজনদের লজ্জায় পরতে হয়।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমি অন্যের অমঙ্গলের কারন।',
        options: [
          { label: 'কখনোই মনে হয় না', value: 0, weight: 0 },
          { label: 'খুবই কম মনে হয়', value: 1, weight: 1 },
          { label: 'মাঝে মাঝে মনে হয়', value: 2, weight: 2 },
          { label: 'বেশীর ভাগ সময় মনে হয়', value: 3, weight: 3 },
          { label: 'সব সময়ই মনে হয়', value: 4, weight: 4 },
        ],
      },
    ],
    range: [
      { min: 0, max: 55, severity: 'Cut-off Score' },
      { min: 56, max: 72, severity: 'Mild' },
      { min: 73, max: 91, severity: 'Moderate' },
      { min: 92, max: 109, severity: 'Severe' },
      { min: 110, max: 100000, severity: 'Profound' },
    ],
  },
  // Aggression Scale
  {
    id: 'aggression_scale',
    name: 'Aggression Scale',
    needToEvaluate: true,
    copyright: "Constructed and Standadised by Km.Roma Pal, Dr. (smt) Tasnum Naqvi",
    ques: [
      {
        question:
          'প্রয়োজন হলে আমার দ্বারা পরিবারের নিয়ম-নীতি ভেঙে ফেলার সম্ভাবনা কতটুকু?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'এমনকি যুক্তিসঙ্গত কোন বিষয়ও যদি লোকজন গ্রহণ না করে তবে আমার মধ্যে কি রাগ হয়?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'যখন আমার চলার পথে সামাজিক রীতিনীতি গুলো বাধা হয়ে দাঁড়ায় তখন এই রীতিনীতিকে কতটুকু সঠিক বলে মনে করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'ভয়ঙ্কর কাজ করতে কতটুকু আমি পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'পরিকল্পিত একটি যুদ্ধে কতখানি ভয়ঙ্কর যোদ্ধা হতে পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'যে আমাকে অমর্যাদা করেছে তাকে আঘাত করার জন্য কতটুকু চিন্তা করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'মারামারি/ লড়াই এর পরিপূর্ণ ছবি দেখতে আমি কতটুকু পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'খুব ছোট ঘটনাতেও আমি কেমন রেগে যাই?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          '‘ইটটি মারলে পাটকেলটি খেতে হয়’ - এই প্রবাদটির সাথে আমি কতটুকু একমত?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'আমার বাড়ির প্রতিটি কামরায় যুদ্ধের সাথে সম্পর্কিত ছবি ঝুলিয়ে রাখতে আমি কতটুকু পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'আমার মতো করে লোকজন কাজ না করলে আমি কতটুকু রেগে যাই?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'অন্যের ছবির তুলনায় তলোয়ার/ অস্ত্রসহ যোদ্ধার ছবি আমি কতটুকু পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'লোকজনের সাথে তর্ক করতে গিয়ে আমি কতটা রেগে যাই?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'তর্ক করার পূর্বে আমি কতটা চিন্তা করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'বড়রা আমার সাথে একমত না হলে আমার কাপড় ছিঁড়তে আমি কতটা পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'আমার সহকর্মীরা আমাকে নিয়ে হাসাহাসি/ ঠাট্টা করলে তাদেরকে আঘাত করতে আমি কতটা একমত/ পক্ষপাতী?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'নির্বাচনী প্রচারণায় প্রার্থীদের উচ্চ বাক্য/ উচ্চস্বরে কথা বলা আমি কতটা পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'সমাজের বিরুদ্ধে যারা বিদ্রোহ করে তাদের সাথে বন্ধুত্ব করতে আমি কতটা পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'যোদ্ধাদের গল্প পড়তে আমি কতটুকু পছন্দ করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'লোকজন আমার মতামতকে গুরুত্ব না দিলে আমি কতটা রেগে যাই?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'কোন বাচ্চা যদি জেনে শুনে ভুল উত্তর দেয় তবে তাকে কতটুকু মারতে ইচ্ছে করে?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'যে শিক্ষক অনিয়মিত তাকে অবাঞ্ছিত হিসেবে বাদ দেয়ার অনুভূতি আমার মধ্যে কতটুকু?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'যেসব বই আমাদের সংস্কৃতির জন্য উপযুক্ত নয় সেগুলো  ছিড়ে ও পুড়িয়ে ফেলার দৃষ্টিভঙ্গির সাথে আমি কতটুকু একমত?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'হাতেনাতে ধরা পড়া চোর কে হত্যা করার দৃষ্টিভঙ্গির সাথে আমি কতটা একমত?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'অন্যান্য খবরের তুলনায় যুদ্ধের খবরের প্রতি আমি কতটা আগ্রহী?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'পরাজিত হলে আমার দলের খেলোয়াড়দের আঘাত করার চিন্তা আমি কতটুকু করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'আমার জিনিস ফিরিয়ে দিতে কেউ দেরি করলে আমি কতটুকু রেগে যাই?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question: 'ছোটরা অপমান করলে তাদের আঘাত করাটা আমি কতটুকু সমর্থন করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'শুধুমাত্র সাহসীদের ছবি সম্বলিত আলোকচিত্র প্রদর্শনীর আয়োজন করাটা আমি কতটুকু সমর্থন করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
      {
        question:
          'অনিয়মিত একজন ছাত্রকে বিদ্যালয় থেকে বহিষ্কার করাটা আমি কতটা সমর্থন করি?',
        options: [
          { label: 'পুরোপুরি প্রযোজ্য', value: 0, weight: 5 },
          { label: 'বেশ প্রযোজ্য', value: 1, weight: 4 },
          { label: 'সাধারনভাবে প্রযোজ্য', value: 2, weight: 3 },
          { label: 'অনেকটা প্রযোজ্য', value: 3, weight: 2 },
          { label: 'কম প্রযোজ্য', value: 4, weight: 1 },
          { label: 'একদমই প্রযোজ্য নয়', value: 5, weight: 0 },
        ],
      },
    ],
    range: [
      { min: 0, max: 45, severity: 'স্বাভাবিক মাত্রার ক্রোধ' },
      { min: 46, max: 60, severity: 'নিম্নমাত্রার ক্রোধ' },
      { min: 61, max: 89, severity: 'মাঝারি মাত্রার ক্রোধ' },
      { min: 90, max: 106, severity: 'উচ্চমাত্রার ক্রোধ' },
      { min: 107, max: 100000, severity: 'চরম মাত্রার ক্রোধ' },
    ],
  },
  // Satisfaction with life scale
  {
    id: 'satisfaction_with_life_scale',
    name: 'Satisfaction with life scale',
    needToEvaluate: true,
    copyright: "Developed by Diener, Emmons, Larsen & Griffin",
    ques: [
      {
        question: 'জীবনের বেশিরভাগ ক্ষেত্রে আমি সফল সফল',
        options: [
          { label: 'সম্পুর্ন ভাবে একমত ', value: 0, weight: 7 },
          { label: 'একমত', value: 1, weight: 6 },
          { label: 'কিছুটা একমত ', value: 2, weight: 5 },
          { label: 'নিরপেক্ষ ', value: 3, weight: 4 },
          { label: 'কিছুটা দ্বিমত ', value: 4, weight: 3 },
          { label: 'দ্বিমত ', value: 5, weight: 2 },
          { label: 'সম্পূর্ণভাবে দ্বিমত ', value: 6, weight: 1 },
        ],
      },
      {
        question:
          'আমার অবস্থা সর্বক্ষেত্রে সাফল্যময় অথবা আমার অবস্থা জীবনের সর্বক্ষেত্রে চমৎকার',
        options: [
          { label: 'সম্পুর্ন ভাবে একমত ', value: 0, weight: 7 },
          { label: 'একমত', value: 1, weight: 6 },
          { label: 'কিছুটা একমত ', value: 2, weight: 5 },
          { label: 'নিরপেক্ষ ', value: 3, weight: 4 },
          { label: 'কিছুটা দ্বিমত ', value: 4, weight: 3 },
          { label: 'দ্বিমত ', value: 5, weight: 2 },
          { label: 'সম্পূর্ণভাবে দ্বিমত ', value: 6, weight: 1 },
        ],
      },
      {
        question: 'আমি আমার এ জীবনে সন্তুষ্ট',
        options: [
          { label: 'সম্পুর্ন ভাবে একমত ', value: 0, weight: 7 },
          { label: 'একমত', value: 1, weight: 6 },
          { label: 'কিছুটা একমত ', value: 2, weight: 5 },
          { label: 'নিরপেক্ষ ', value: 3, weight: 4 },
          { label: 'কিছুটা দ্বিমত ', value: 4, weight: 3 },
          { label: 'দ্বিমত ', value: 5, weight: 2 },
          { label: 'সম্পূর্ণভাবে দ্বিমত ', value: 6, weight: 1 },
        ],
      },
      {
        question:
          'আমি আমার জীবনে গুরুত্বপূর্ণ যা কিছু চেয়েছি সবকিছুই আমি পেয়েছি',
        options: [
          { label: 'সম্পুর্ন ভাবে একমত ', value: 0, weight: 7 },
          { label: 'একমত', value: 1, weight: 6 },
          { label: 'কিছুটা একমত ', value: 2, weight: 5 },
          { label: 'নিরপেক্ষ ', value: 3, weight: 4 },
          { label: 'কিছুটা দ্বিমত ', value: 4, weight: 3 },
          { label: 'দ্বিমত ', value: 5, weight: 2 },
          { label: 'সম্পূর্ণভাবে দ্বিমত ', value: 6, weight: 1 },
        ],
      },
      {
        question:
          'যদি আমার সম্পূর্ণ জীবন এভাবেই চলে তবে আমি আমার জীবনের কোন কিছুই পরিবর্তন করবো না',
        options: [
          { label: 'সম্পুর্ন ভাবে একমত ', value: 0, weight: 7 },
          { label: 'একমত', value: 1, weight: 6 },
          { label: 'কিছুটা একমত ', value: 2, weight: 5 },
          { label: 'নিরপেক্ষ ', value: 3, weight: 4 },
          { label: 'কিছুটা দ্বিমত ', value: 4, weight: 3 },
          { label: 'দ্বিমত ', value: 5, weight: 2 },
          { label: 'সম্পূর্ণভাবে দ্বিমত ', value: 6, weight: 1 },
        ],
      },
    ],
    range: [
      { min: 31, max: 35, severity: 'চরমভাবে অথবা সম্পূর্ণভাবে সন্তুষ্ট' },
      { min: 26, max: 30, severity: 'সন্তুষ্ট' },
      { min: 21, max: 25, severity: 'কিছুটা সন্তুষ্ট' },
      { min: 20, max: 20, severity: 'নিরপেক্ষ' },
      { min: 15, max: 19, severity: 'কিছুটা অসন্তুষ্ট' },
      { min: 10, max: 14, severity: 'অসন্তুষ্ট' },
      { min: 5, max: 9, severity: 'চরমভাবে অথবা সম্পূর্ণভাবে অসন্তুষ্ট' },
    ],
  },
  // Hopelessness Scale (Beck)
  {
    id: 'hopelessness_scale_(beck)',
    name: 'Hopelessness Scale (Beck)',
    needToEvaluate: true,
    copyright: "Developed by Dr. Aaron T. Beck",
    ques: [
      {
        question: 'আমি আশা এবং উৎসাহ নিয়ে ভবিষ্যতের অপেক্ষায় আছি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'আমি সব আশা ছেড়ে দিয়েছি কারণ নিজের ভাল কোন কিছু করার জন্য আমার আর কিছুই করার নেই',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'যখন খারাপ সময়ের ভেতর দিয়ে যাই, তখন আমি বুঝতে পারি যে সময় সবসময় খারাপ যাবে না',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: '১০ বছর পর আমার জীবন কেমন হবে তা আমি কল্পনাও করতে পারি না',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'আমি যেসব কাজ খুব বেশি করতে চাই,  তা শেষ করার মতো যথেষ্ট সময় আমার আছে',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'যেসব বিষয়/ কাজ নিয়ে আমি উদ্বিগ্ন থাকি আমি আশা করি যে ভবিষ্যতে আমি সেসব বিষয়ে সফল হব',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমার মনে হয় আমার ভবিষ্যৎ অন্ধকারাচ্ছন্ন',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'আমি সাধারন ভাবে একজন ভাগ্যবান এবং জীবনের ভালো জিনিস গুলোর অধিকাংশ একজন সাধারন মানুষ অপেক্ষা বেশি পাওয়ার আশা করি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'আমি বিশ্রাম নেয়ার কোনো সুযোগই পাইনা আর ভবিষ্যতে যে পাব তা বিশ্বাস করার মতো কোনো কারণও নেই',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'অতীত অভিজ্ঞতা গুলো আমাকে ভবিষ্যতের জন্য সুন্দরভাবে তৈরি করে দিয়েছে',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি আমার সামনে আনন্দের পরিবর্তে শুধু নিরানন্দ দেখি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'আমি পেতে চাই তা পাওয়ার কোনো আসা আমার নাই',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'আমি আশা করি ভবিষ্যতে আমি বর্তমান অবস্থার চেয়ে বেশি সুখে থাকবো',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি যে ভাবে চাই কোন কিছুই সেভাবে পাইনা',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'ভবিষ্যৎ সম্পর্কে আমি বেশ আস্থাশীল',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি চাই তা কখনোই পাইনা, তাই নিজের জন্য চাওয়াটা বোকামি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'ভবিষ্যতে আমার প্রকৃতই সুখী/ তৃপ্ত হবার (অর্থাৎ আমি প্রকৃতপক্ষে সন্তুষ্ট থাকব)  সম্ভাবনা খুবই কম',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'ভবিষ্যৎ আমার  কাছে অস্পষ্ট  এবং অনিশ্চিত',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'আমি খারাপ সময়ের চাইতে ভালো সময়ের জন্য বেশি অপেক্ষা করবো',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'কোন কিছু পাওয়ার জন্য চেষ্টা করার কোন মানে হয় না, কারণ সম্ভবতঃ সেটা পাওয়া যাবে না',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
    ],
    range: [
      { min: 0, max: 3, severity: 'None or minimal' },
      { min: 4, max: 8, severity: 'Mild' },
      { min: 9, max: 14, severity: 'Moderate' },
      { min: 15, max: 100000, severity: 'Severe' },
    ],
  },
  // Social Interaction Anxiety Scale
  {
    id: 'social_interaction_anxiety_scale',
    name: 'Social Interaction Anxiety Scale',
    needToEvaluate: true,
    copyright: "Developed by R. P. Mattick& J. C. Clark",
    ques: [
      {
        question:
          'আমাকে কতৃপক্ষ পর্যায়ের (শিক্ষক বা বস) কারো সাথে কথা বলতে হলে আমি বিচলিত বোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question: 'অন্যদের চোখের দিকে সরাসরি তাকাতে আমার আসুবিধা হয়',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'যদি আমার নিজের সম্পর্কে বা নিজের অনুভূতি সম্পর্কে কিছু বলতে হয় , তাহলে আমি খুব উদ্বিগ্নবোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমি যাদের সাথে কাজ করি তাদের সাথে স্বচ্ছন্দে মিশতে অসুবিধা বোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমি সমবয়সীদের সাথে খুব সহজে বন্ধুত্ব করতে পারি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 4, weight: 4 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 3, weight: 3 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 1, weight: 1 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'রাস্তায় চলতে গিয়ে পরিচিত কারো সাক্ষাৎ পেলে আমি অস্বস্তিবোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question: 'সামাজিক অবস্থায় মিশতে গিয়ে আমি অস্বস্তিবোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'যদি আমি কেবল একজনের সাথে একাকী থাকি তাহলে আমি খুব উদ্বিগ্ন বোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমি কোন পার্টিতে মানুষের সাথে সাক্ষাৎ করতে স্বচ্ছন্দ বোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 4, weight: 4 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 3, weight: 3 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 1, weight: 1 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 0, weight: 0 },
        ],
      },
      {
        question: 'অন্যদের সাথে কথা বলতে আমার অসুবিধা হয়',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question: 'যে বিষয়ে বলতে হবে তা নিয়ে চিন্তা করা আমার জন্য সহজ',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 4, weight: 4 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 3, weight: 3 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 1, weight: 1 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'আমাকে বিদঘুটে মনে হয় একথা ভেবে আমি নিজেকে প্রকাশ করতে বিব্রত বোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমি অন্যদের মতামতে বিরোধিতা করতে অসুবিধা বোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'বিপরীত লিঙ্গের আকর্ষণীয় কোন ব্যাক্তির সাথে কথা বলতে আমার অসুবিধা লাগে',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমি কোন সামাজিক অনুষ্ঠানে কি বলতে হবে তা জানি না ভেবে চিন্তিত থাকি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমি যাদের ভালোভাবে চিনি না তাদের সাথে মিশতে আমার নার্ভাস লাগে',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমি অনুভব করি, কথা বলার সময় বিব্রতকর কিছু বলে ফেলতে পারি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমি যখন কোন দলের সাথে মিশি তখন আমি সবসময়ই অবহেলিত হবার ভয়ে থাকি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question: 'আমি দলের সাথে মিশতে উদ্বিগ্ন বোধ করি',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
      {
        question:
          'আমি ঠিক বুঝতে পারি না , অল্প পরিচিত কাউকে শুভেচ্ছা দিতে হয় কি না',
        options: [
          { label: 'আমার জন্য মোটেই প্রযোজ্য নয়', value: 0, weight: 0 },
          { label: 'আমার জন্য কিছুটা প্রযোজ্য / সত্য', value: 1, weight: 1 },
          { label: 'আমার জন্য মোটামুটি ধরনের প্রযোজ্য', value: 2, weight: 2 },
          { label: 'আমার জন্য অনেক খানিই  প্রযোজ্য', value: 3, weight: 3 },
          { label: 'আমার জন্য সম্পূর্ণ প্রযোজ্য', value: 4, weight: 4 },
        ],
      },
    ],
    range: [
      { min: 0, max: 20, severity: 'Slightly' },
      { min: 21, max: 40, severity: 'Moderately' },
      { min: 41, max: 60, severity: 'Very Much' },
      { min: 61, max: 80, severity: 'Extremely' },
    ],
  },
  {
    id: 'nicotine_addiction_scale',
    name: 'Nicotine Addiction Scale',
    needToEvaluate: true,
    copyright: "Translated by Farha Deeba and Rumala Ali",
    ques: [
      {
        question: 'সকালে ঘুম থেকে উঠার পর কতক্ষণ পর আপনি প্রথম ধূমপান করেন?',
        options: [
          { label: '৫ মিনিট মধ্যে মিনিটের মধ্যে', value: 3, weight: 3 },
          { label: '৬ - ৩০ মিনিটের মধ্যে', value: 2, weight: 2 },
          { label: '৩১ - ৬০ মিনিটের মধ্যে', value: 1, weight: 1 },
          { label: '১ ঘন্টা পরে', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'ধূমপান নিষিদ্ধ এলাকায় (যেমন: সিনেমা হল, লাইব্রেরী, বাজার, মার্কেট ইত্যাদি) কি আপনি ধূমপান থেকে বিরত অসুবিধা বোধ করেন?',
        options: [
          { label: 'হ্যাঁ', value: 1, weight: 1 },
          { label: 'না', value: 0, weight: 0 },
        ],
      },
      {
        question: 'কোন সময়ের সিগারেটটি ছাড়তে আপনার বেশি কষ্ট হয়?',
        options: [
          { label: 'সকালের প্রথম সিগারেট', value: 1, weight: 1 },
          { label: 'অন্যান্য যে কোনো সময়ে', value: 0, weight: 0 },
        ],
      },
      {
        question: 'প্রতিদিন আপনি কয়টা সিগারেট খান?',
        options: [
          { label: '১০ টি অথবা তার কম', value: 0, weight: 0 },
          { label: '১১ - 20 টা', value: 1, weight: 1 },
          { label: '২১ – ৩০ টা', value: 2, weight: 2 },
          { label: '৩১ টি অথবা তার বেশি', value: 3, weight: 3 },
        ],
      },
      {
        question:
          'দিনের অন্য সময়ের তুলনায় আপনি কি ঘুম থেকে ওঠার এক ঘণ্টার মধ্যে বেশি ধূমপান করেন ?',
        options: [
          { label: 'হ্যাঁ', value: 1, weight: 1 },
          { label: 'না', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'অসুস্থ হওয়ার কারণে আপনাকে যদি বেশিরভাগ সময় বিছানায় থাকতে হয়, তখনও কি আপনি ধূমপান করেন?',
        options: [
          { label: 'হ্যাঁ', value: 1, weight: 1 },
          { label: 'না', value: 0, weight: 0 },
        ],
      },
    ],
    range: [
      { min: 0, max: 20, severity: 'Slightly' },
      { min: 21, max: 40, severity: 'Moderately' },
      { min: 41, max: 60, severity: 'Very Much' },
      { min: 61, max: 80, severity: 'Extremely' },
    ],
  },
  {
    id: 'social_avoidance_and_distress_scale',
    name: 'Social avoidance and distress scale',
    needToEvaluate: true,
    copyright: "Translated by Farah Deeba, Shayla Arjuman, Nadira Shammi & Joha-E-Shamsia",
    ques: [
      {
        question: 'আমি পরিচিত সামাজিক স্বচ্ছন্দ বোধ করি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'সামাজিকতা মানতে বাধ্য করে এমন অবস্থা আমি এড়িয়ে চলতে চেষ্টা করি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'অপরিচিত লোকের মাঝেও আমি স্বচ্ছন্দ বোধ করি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'মানুষকে এড়িয়ে চলার পিছনে আমার কোনো বিশেষ উদ্দেশ্য নেই',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি প্রায় সামাজিক অনুষ্ঠান সমূহকে বিশৃংখল দেখি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'আমি সাধারনত সামাজিক অনুষ্ঠানে স্বচ্ছন্দ বোধ করি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি বিপরীত লিঙ্গের কারো সাথে কথোপকথনের সময় সাধারনত থাকি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'আমি ভালোভাবে কাউকে না জানা পর্যন্ত তাদের সাথে কথোপকথন এড়িয়ে চলি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'যদি কোন নতুন ব্যক্তির সাথে পরিচয়ের সুযোগ আসে তাহলে আমি প্রায়ই তা গ্রহণ করি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'পুরুষ ও মহিলা উভয়ের উপস্থিতিতে কোন ঘরোয়া প্রীতি সম্মেলনে যোগদান করতে আমি ভীষণ ভাবে নার্ভাস বোধ করি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'ভালোভাবে কাউকে না জেনে লোকজনের সাথে মিশতে আমি সাধারনত নার্ভাস হয়ে পড়ি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'আমি সাধারনত অনেক লোকের সাথে থাকতে স্বচ্ছন্দ বোধ করি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি প্রায়ই লোকজন থেকে দূরে থাকতে চাই',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'অপরিচিত কোন লোকজনের সাথে থাকতে আমি সাধারনত অস্বস্তি বোধ করি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'কারো সাথে প্রথম পরিচয়ে আমি স্বচ্ছন্দ বোধ করি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'কারো সাথে পরিচিত হওয়ার সময় আমি উত্তেজিত ও নার্ভাস হয়ে পড়ি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'ঘরভর্তি অপরিচিত লোকের মধ্যে আমি যে কোন ভাবেই প্রবেশ করতে পারি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি নিজে ইচ্ছায় কোনো বড় সমাবেশে যোগদান করি না',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'বয়োজ্যেষ্ঠরা যখন আমার সাথে কথা বলতে চান তখন আমি আগ্রহ ভরে তাদের সাথে কথা বলি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question:
          'আমি যখন একদল লোকের মাঝে থাকি তখন প্রায়ই আমার মনে হয় আমি যেন কিনারে দাঁড়িয়ে আছি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'আমি লোকজন থেকে নিজেকে দূরে সরিয়ে রাখতে ভালোবাসি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'কোন ঘরোয়া বা সামাজিক অনুষ্ঠানে লোকজনের সাথে কথা বলতে আমি সংকোচ বোধ করিনা',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি বড় কোন সমাবেশে কদাচিৎ সহজ হতে পারি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'সামাজিক কোনো অনুষ্ঠান এড়াতে আমি প্রায়ই অজুহাত  খুঁজি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question:
          'লোকজনের সাথে পরস্পর পরিচয় করিয়ে দিতে আমি কখনও কখনও দায়িত্ব গ্রহণ করে থাকি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আনুষ্ঠানিক কোনো সামাজিক অনুষ্ঠান আমি এড়াতে চেষ্টা করি',
        options: [
          { label: 'সত্য', value: 1, weight: 1 },
          { label: 'মিথ্যা', value: 0, weight: 0 },
        ],
      },
      {
        question: 'আমি সাধারনত সব ধরনের সামাজিক অনুষ্ঠানেই যাই',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
      {
        question: 'আমি সহজে অপরের সাথে মিশে আনন্দ উপভোগ করি',
        options: [
          { label: 'সত্য', value: 0, weight: 0 },
          { label: 'মিথ্যা', value: 1, weight: 1 },
        ],
      },
    ],
    range: [
      { min: 0, max: 5, severity: 'সর্বনিম্ন' },
      { min: 6, max: 15, severity: 'মধ্যম' },
      { min: 16, max: 28, severity: 'সর্বোচ্চ' },
    ],
  },
];
