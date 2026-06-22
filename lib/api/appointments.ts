// The swap point. When NEXT_PUBLIC_USE_MOCK is anything other than "false",
// every call resolves from lib/mock/appointments. Flip the flag (or set the
// env var to "false") and the same functions hit the Spring Boot backend.
// Components and hooks never change.

import { api } from "@/lib/axios"; // ⚠️ match your lib/api/queue.ts import exactly
import * as mock from "@/lib/mock/appointments";
import type {
  Appointment,
  AppointmentDepartment,
  AppointmentFilters,
  AppointmentStats,
  UpdateAppointmentInput,
} from "@/lib/types/appointments";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchAppointments(
  filters: AppointmentFilters
): Promise<Appointment[]> {
  if (USE_MOCK) return mock.queryAppointments(filters);
  const { data } = await api.get<Appointment[]>("/appointments", {
    params: filters,
  });
  return data;
}

export async function fetchAppointmentStats(
  date: string
): Promise<AppointmentStats> {
  if (USE_MOCK) return mock.computeStats(date);
  const { data } = await api.get<AppointmentStats>("/appointments/stats", {
    params: { date },
  });
  return data;
}

export async function fetchAppointmentDepartments(): Promise<
  AppointmentDepartment[]
> {
  if (USE_MOCK) return mock.listDepartments();
  const { data } = await api.get<AppointmentDepartment[]>(
    "/appointments/departments"
  );
  return data;
}

export async function updateAppointment(
  input: UpdateAppointmentInput
): Promise<Appointment> {
  if (USE_MOCK) return mock.applyUpdate(input);
  const { data } = await api.patch<Appointment>(`/appointments/${input.id}`, {
    status: input.status,
  });
  return data;
}