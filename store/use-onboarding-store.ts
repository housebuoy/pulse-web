import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { OperatingHoursValue } from "@/components/onboarding/operating-hours";

// Facility identity (name, logo, region, address, HeFRA) is captured on
// /request-access, before approval — it's not part of this store. What's
// left to collect once inside /onboarding is purely operational data
// (departments step) plus the administrator's account details (admin step).
export interface OnboardingData {
  // Step 1 — Departments & operations
  phone: string;
  email: string;
  specialties: string[];
  capacity: string;
  duration: string;
  operatingHours: OperatingHoursValue;

  // Step 2 — Administrator account. Verified on /request-access (requester
  // === admin) and seeded here as soon as approval resolves — see
  // app/(auth)/onboarding/page.tsx — not collected or written by AdminStep
  // itself. The rest of the account (name, password) is never persisted
  // here; password in particular stays local-only, even to sessionStorage.
  adminEmail: string;
}

interface OnboardingStore {
  data: OnboardingData;
  updateData: (fields: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
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
// from the URL, the form data comes back from here.
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
    },
  ),
);
