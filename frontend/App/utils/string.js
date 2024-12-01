export const capitalizeFirstLetter = (inputString) => {
  if (!inputString) return '';
  return inputString.charAt(0).toUpperCase() + inputString.slice(1);
};
