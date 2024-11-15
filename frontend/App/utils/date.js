const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

module.exports.formatDateTime = (inputDate) => {
  const dateObj = new Date(inputDate);

  if (isNaN(dateObj)) {
    return "Invalid date format";
  }

  const dayOfWeek = daysOfWeek[dateObj.getUTCDay()];

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('en-US', options);

  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);

  const formattedString = `${formattedDate}, ${formattedTime} (${dayOfWeek})`;

  return formattedString;
}

module.exports.isValidDate = (date) => date instanceof Date && !isNaN(date);
  