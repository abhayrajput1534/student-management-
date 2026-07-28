// Predefined course list (used for the Course dropdown everywhere)
const COURSES = [
  "BCA",
  "B.Sc IT",
  "BBA",
  "B.Com",
  "B.Tech",
  "BA",
  "B.Sc",
  "MCA",
];

// Semesters available (1 to 8 - standard 4 year program)
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Static "system users" count - iss project mein sirf ek admin login hai,
// isliye ye value fixed rakhi hai. Agar future mein multi-user/role based
// login banate hain (teacher/admin/staff) to ye DB se dynamically aayega.
const TOTAL_SYSTEM_USERS = 1;

module.exports = { COURSES, SEMESTERS, TOTAL_SYSTEM_USERS };
