export const genderLists = [
    {
        label: 'পুরুষ',
        value: 'Male',
    },
    {
        label: 'মহিলা',
        value: 'Female',
    },
    {
        label: 'অন্যান্য',
        value: 'Others',
    },
];

export const professionLists = [
    {
        label: 'Clinical psychologist',
        value: 'Clinical psychologist',
    },
    {
        label: 'Assistant clinical psychologist',
        value: 'Assistant clinical psychologist',
    },
    {
        label: 'Psychiatrist',
        value: 'Psychiatrist',
    },
];

export const batchLists = Array.from({ length: new Date().getFullYear() - 1997 }, (_, i) => {
    const year = 1997 + i;
    const v = `Batch ${i + 1} - ${year}/${(year + 1).toString().slice(2)}`;
    return { label: v, value: v };
}).reverse();

export const specAreaLists = [
    {
        label: 'কগনিটিভ বিহ্যাভিওরাল থেরাপি (সি বি টি)',
        value: 'কগনিটিভ বিহ্যাভিওরাল থেরাপি (সি বি টি)',
    },
    { label: 'সাইকো অ্যানালাইস', value: 'সাইকো অ্যানালাইস' },
    {
        label: 'ট্রাঞ্জেকসনাল অ্যানালাইস (টি এ)',
        value: 'ট্রাঞ্জেকসনাল অ্যানালাইস (টি এ)',
    },
    {
        label: 'ই এম ডি আর',
        value: 'ই এম ডি আর',
    },
    {
        label: 'কাপল থেরাপি',
        value: 'কাপল থেরাপি',
    },
    {
        label: 'ফ্যামিলি থেরাপি',
        value: 'ফ্যামিলি থেরাপি',
    },
    {
        label: 'ডায়ালেকটিকাল বিহ্যাভিওরাল থেরাপি',
        value: 'ডায়ালেকটিকাল বিহ্যাভিওরাল থেরাপি',
    },
    {
        label: 'মেডিসিনাল ট্রিট্মেন্ট',
        value: 'মেডিসিনাল ট্রিট্মেন্ট',
    },
    {
        label: 'অন্যান্য',
        value: 'অন্যান্য',
    },
    {
        label: 'প্রযোজ্য নয়',
        value: 'প্রযোজ্য নয়',
    },
];
