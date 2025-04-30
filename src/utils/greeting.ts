export const getTimeOfDay = () => {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) {
    return "Morning";
  } else if (hours >= 12 && hours < 17) {
    return "Afternoon";
  } else {
    return "Evening";
  }
};
