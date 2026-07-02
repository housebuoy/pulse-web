// Pre-seeded sessions for local development and /w preview.
// Real enforcement lives in Spring Boot — these fixtures never reach prod.

import type { WorkspaceSession } from "@/lib/types/auth";

/** One activated doctor account so /w can be built and previewed immediately. */
export const MOCK_DOCTOR_SESSION: WorkspaceSession = {
  staffId: "staff-owusu",
  role: "doctor",
  name: "Dr. Owusu",
  email: "owusu@pulsehealth.test",
  departmentId: "cardiology",
  departmentName: "Cardiology",
  title: "Cardiologist",
  specialty: "Interventional Cardiology",
};

/** Admin session identity (matches lib/mock/dashboard.ts mockUser). */
export const MOCK_ADMIN_SESSION: WorkspaceSession = {
  staffId: "staff-admin",
  role: "admin",
  name: "Dr. Sarah Jenkins",
  email: "sarah.jenkins@knust-hospital.test",
  departmentId: "general-medicine",
  departmentName: "General Medicine",
  title: "Chief Administrator",
};
