const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

module.exports.days = [
  { label: 'রবিবার', value: 'Sunday', id: 0, genId: 3 },
  { label: 'সোমবার', value: 'Monday', id: 1, genId: 4 },
  { label: 'মঙ্গলবার', value: 'Tuesday', id: 2, genId: 5 },
  { label: 'বুধবার', value: 'Wednesday', id: 3, genId: 6 },
  { label: 'বৃহস্পতিবার', value: 'Thursday', id: 4, genId: 7 },
  { label: 'শুক্রবার', value: 'Friday', id: 5, genId: 1 },
  { label: 'শনিবার', value: 'Saturday', id: 6, genId: 2 },
];

module.exports.formatDateTime = (inputDate) => {
  const dateObj = new Date(inputDate);

  if (isNaN(dateObj)) {
    return 'Invalid date format';
  }

  const dayOfWeek = daysOfWeek[dateObj.getUTCDay()];

  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = dateObj.toLocaleDateString('en-US', options);

  const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);

  const formattedString = `${formattedDate}, ${formattedTime} (${dayOfWeek})`;

  return formattedString;
};

module.exports.isValidDate = (date) => date instanceof Date && !isNaN(date);
