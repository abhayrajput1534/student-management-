const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Formats a Date object like: "28 May 2025"
function formatDate(date = new Date()) {
  const d = date.getDate();
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

module.exports = formatDate;
