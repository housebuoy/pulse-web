const DEPARTMENTS = [
  "Cardiology", "Pediatrics", "Dermatology", "Orthopedics", "Radiology",
  "Neurology", "Oncology", "General Medicine", "Obstetrics & Gynecology",
  "Emergency", "ENT", "Ophthalmology",
];

export { DEPARTMENTS };

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Holidays"];

export const TIMES = Array.from({ length: (24 - 0) * 2 }, (_, i) => { // 00:00 to 23:30
  const mins = i * 30;
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
});


export const REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North",
];