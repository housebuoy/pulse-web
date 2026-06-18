const DEPARTMENTS = [
  "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Radiology",
  "Neurology", "Oncology", "General Medicine", "Obstetrics & Gynecology",
  "Emergency", "ENT", "Ophthalmology",
];

export { DEPARTMENTS };

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const TIMES = Array.from({ length: (22 - 6) * 2 + 1 }, (_, i) => {
  const mins = 6 * 60 + i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});