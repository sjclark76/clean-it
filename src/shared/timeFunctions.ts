// Helper to parse time string "HH:MM AM/PM" to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  const [time, modifier] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);

  let tempHours = hours;
  if (modifier.toUpperCase() === 'PM' && hours !== 12) tempHours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) tempHours = 0;
  return tempHours * 60 + minutes;
};

// Helper to format minutes from midnight back to "HH:MM AM/PM"
const minutesToTime = (totalMinutes: number): string => {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const modifier = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${String(hours12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${modifier}`;
};

// Formatting functions (can be part of the hook or separate utils)
const formatDateDisplay = (dateString: string) => {
  const dateObj = new Date(dateString + 'T00:00:00');
  return dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export { timeToMinutes, minutesToTime, formatDateDisplay };
