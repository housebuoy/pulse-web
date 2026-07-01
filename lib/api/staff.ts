// Swap point. USE_MOCK true → resolves from lib/mock/staff.
// Flip the flag and the same functions hit Spring Boot. Hooks/components don't move.

import { api } from "@/lib/axios"; // ⚠️ match your lib/api/queue.ts import exactly
import * as mock from "@/lib/mock/staff";
import type {
  CreateStaffInput,
  StaffMember,
  UpdateStaffInput,
} from "@/lib/types/staff";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function fetchStaff(): Promise<StaffMember[]> {
  if (USE_MOCK) return mock.listStaff();
  const { data } = await api.get<StaffMember[]>("/staff");
  return data;
}

export async function fetchStaffMember(id: string): Promise<StaffMember> {
  if (USE_MOCK) return mock.getStaffMember(id);
  const { data } = await api.get<StaffMember>(`/staff/${id}`);
  return data;
}

export async function updateStaff(
  input: UpdateStaffInput
): Promise<StaffMember> {
  if (USE_MOCK) return mock.applyUpdate(input);
  const { id, ...body } = input;
  const { data } = await api.patch<StaffMember>(`/staff/${id}`, body);
  return data;
}

export async function createStaff(
  input: CreateStaffInput
): Promise<StaffMember> {
  if (USE_MOCK) return mock.createStaff(input);
  const { data } = await api.post<StaffMember>("/staff", input);
  return data;
}
