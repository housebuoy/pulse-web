// Swap point. USE_MOCK true → resolves from lib/mock/departments.
// Flip the flag and the same functions hit Spring Boot. Hooks/components don't move.

import { api } from "@/lib/axios"; // ⚠️ match your lib/api/queue.ts import exactly
import * as mock from "@/lib/mock/departments";
import type {
  AssignHeadDoctorInput,
  CreateDepartmentInput,
  Department,
  DepartmentStats,
  UpdateDepartmentInput,
} from "@/lib/types/departments";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchDepartments(): Promise<Department[]> {
  if (USE_MOCK) return mock.listDepartments();
  const { data } = await api.get<Department[]>("/departments");
  return data;
}

export async function fetchDepartmentStats(): Promise<DepartmentStats> {
  if (USE_MOCK) return mock.computeStats();
  const { data } = await api.get<DepartmentStats>("/departments/stats");
  return data;
}

export async function updateDepartment(
  input: UpdateDepartmentInput
): Promise<Department> {
  if (USE_MOCK) return mock.applyUpdate(input);
  const { id, ...body } = input;
  const { data } = await api.patch<Department>(`/departments/${id}`, body);
  return data;
}

export async function createDepartment(
  input: CreateDepartmentInput
): Promise<Department> {
  if (USE_MOCK) return mock.createDepartment(input);
  const { data } = await api.post<Department>("/departments", input);
  return data;
}

export async function assignHeadDoctor(
  input: AssignHeadDoctorInput
): Promise<Department> {
  if (USE_MOCK) return mock.assignHeadDoctor(input);
  const { data } = await api.patch<Department>(
    `/departments/${input.id}/head-doctor`,
    { headDoctorName: input.headDoctorName }
  );
  return data;
}

export async function deleteDepartment(id: string): Promise<void> {
  if (USE_MOCK) return mock.deleteDepartment(id);
  await api.delete(`/departments/${id}`);
}