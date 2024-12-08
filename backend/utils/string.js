exports.capitalizeFirstLetter = inputString => {
  if (!inputString) return '';
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
};

exports.toString = input => {
  if (typeof input === 'string') return input;
  if (typeof input === 'number') return input.toString();
  return '';
};
