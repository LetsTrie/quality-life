export const lightenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16); // Convert HEX to decimal
  const r = Math.min(255, Math.floor((num >> 16) + ((255 - (num >> 16)) * percent) / 100));
  const g = Math.min(
    255,
    Math.floor(((num >> 8) & 0x00ff) + ((255 - ((num >> 8) & 0x00ff)) * percent) / 100)
  );
  const b = Math.min(
    255,
    Math.floor((num & 0x0000ff) + ((255 - (num & 0x0000ff)) * percent) / 100)
  );
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};
