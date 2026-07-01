import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as staffApi from "@/lib/api/staff";
import type { CreateStaffInput, UpdateStaffInput } from "@/lib/types/staff";

const keys = {
  all: ["staff"] as const,
  list: () => [...keys.all, "list"] as const,
};

export function useStaff() {
  return useQuery({
    queryKey: keys.list(),
    queryFn: () => staffApi.fetchStaff(),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}

// Derives a single member from the shared list query instead of firing a
// second request — mirrors useDepartment in hooks/use-departments.ts.
export function useStaffMember(id: string | undefined) {
  const query = useStaff();
  const member = id ? query.data?.find((s) => s.id === id) : undefined;
  return { ...query, data: member };
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateStaffInput) => staffApi.updateStaff(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffInput) => staffApi.createStaff(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
  });
}
