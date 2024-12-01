function numberWithCommas(x) {
  if (!x) return '০';
  let formattedNumber = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const englishToBangla = {
    0: '০',
    1: '১',
    2: '২',
    3: '৩',
    4: '৪',
    5: '৫',
    6: '৬',
    7: '৭',
    8: '৮',
    9: '৯',
  };

  return formattedNumber.replace(/\d/g, (digit) => englishToBangla[digit]);
}

module.exports = {
  numberWithCommas,
};
