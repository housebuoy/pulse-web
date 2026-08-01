import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OperatingHoursValue } from "@/components/onboarding/operating-hours";

export interface OnboardingData {
  // Step 1 — Facility setup
  hospitalName: string;
  region: string;
  address: string;
  hefraLicense: string; // optional — see FacilitySetupStep
  document: File | null; // optional — see FacilitySetupStep; not persisted, see below
  logoUrl?: string; // required — see FacilitySetupStep

  // Step 2 — Departments & operations
  phone: string;
  email: string;
  specialties: string[];
  capacity: string;
  duration: string;
  operatingHours: OperatingHoursValue;

  // Step 3 — Administrator account (email only; password is deliberately
  // never persisted here, even to sessionStorage — see AdminStep)
  adminEmail: string;
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

  adminEmail: "",
};

// Persisted to sessionStorage (not localStorage — this is a single in-
// progress signup, not something that should outlive the tab) so the
// /onboarding?step= route actually survives a refresh: the step comes back
// from the URL, the form data comes back from here. `document` is a raw
// File, which isn't JSON-serializable across a reload, so it's excluded —
// harmless now that the HeFRA document is optional (FacilitySetupStep).
export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      data: initialData,
      updateData: (fields) =>
        set((state) => ({ data: { ...state.data, ...fields } })),
      reset: () => set({ data: initialData }),
    }),
    {
      name: "pulse-onboarding",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        data: { ...state.data, document: null },
      }),
    },
  ),
);
