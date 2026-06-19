import { create } from "zustand";
import type { OperatingHoursValue } from "@/components/onboarding/operating-hours";

export interface OnboardingData {
  // Step 1 — Facility setup
  hospitalName: string;
  region: string;
  address: string;
  hefraLicense: string;
  document: File | null;

  // Step 2 — Departments & operations
  phone: string;
  email: string;
  specialties: string[];
  capacity: string;
  duration: string;
  operatingHours: OperatingHoursValue;
}

interface OnboardingStore {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  hospitalName: "",
  region: "",
  address: "",
  hefraLicense: "",
  document: null,

  phone: "",
  email: "",
  specialties: [],
  capacity: "500",
  duration: "20",
  operatingHours: {
    alwaysOpen: false,
    schedules: [
      {
        id: "default-1",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        open: "08:00",
        close: "17:00",
      },
    ],
  },
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: initialData,
  updateData: (fields) =>
    set((state) => ({ data: { ...state.data, ...fields } })),
  reset: () => set({ data: initialData }),
}));
