import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as departmentsApi from "@/lib/api/departments";
import type {
  AssignHeadDoctorInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@/lib/types/departments";

const keys = {
  all: ["departments"] as const,
  list: () => [...keys.all, "list"] as const,
  stats: () => [...keys.all, "stats"] as const,
};

export function useDepartments() {
  return useQuery({
    queryKey: keys.list(),
    queryFn: () => departmentsApi.fetchDepartments(),
    // Live floor stats change, so poll on the same cadence as queue departments.
    refetchInterval: 10_000,
    placeholderData: (prev) => prev,
  });
}

// Derives a single department from the shared list query instead of firing a
// second request — selection/edit just need a lookup, not a new fetch.
export function useDepartment(id: string | undefined) {
  const query = useDepartments();
  const department = id ? query.data?.find((d) => d.id === id) : undefined;
  return { ...query, data: department };
}

export function useDepartmentStats() {
  return useQuery({
    queryKey: keys.stats(),
    queryFn: () => departmentsApi.fetchDepartmentStats(),
    refetchInterval: 10_000,
    placeholderData: (prev) => prev,
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateDepartmentInput) =>
      departmentsApi.updateDepartment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDepartmentInput) =>
      departmentsApi.createDepartment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useAssignHeadDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AssignHeadDoctorInput) =>
      departmentsApi.assignHeadDoctor(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => departmentsApi.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}