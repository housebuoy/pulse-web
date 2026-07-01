"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PatientToolbar, type PatientScope } from "@/components/dashboard/patients/patient-toolbar";
import { PatientTable } from "@/components/dashboard/patients/patient-table";
import { PatientFormDialog } from "@/components/dashboard/patients/patient-form-dialog";
import { useCreatePatient, usePatients } from "@/hooks/use-patients";
import { useDepartments } from "@/hooks/use-departments";
import { isHereToday, matchesSearch } from "@/lib/patient-utils";
import type { Gender } from "@/lib/types/patients";

type GenderFilter = Gender | "all";

function PatientsDirectoryBody() {
  // Global header search writes ?q= — read it here instead of a local input
  // so other list pages can share the same param.
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  const [scope, setScope] = useState<PatientScope>("all");
  const [departmentId, setDepartmentId] = useState("all");
  const [gender, setGender] = useState<GenderFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: patients = [], isLoading } = usePatients();
  const { data: allDepartments = [] } = useDepartments();
  const create = useCreatePatient();

  const departments = useMemo(
    () => allDepartments.filter((d) => d.status !== "archived"),
    [allDepartments],
  );

  const hereCount = useMemo(
    () => patients.filter(isHereToday).length,
    [patients],
  );

  const visible = useMemo(
    () =>
      patients.filter(
        (p) =>
          (scope === "all" || isHereToday(p)) &&
          (departmentId === "all" || p.currentVisit?.departmentId === departmentId) &&
          (gender === "all" || p.gender === gender) &&
          matchesSearch(p, query),
      ),
    [patients, scope, departmentId, gender, query],
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-6 p-6">
        <PatientToolbar
          scope={scope}
          onScopeChange={setScope}
          totalCount={patients.length}
          hereCount={hereCount}
          departments={departments.map((d) => ({ id: d.id, name: d.name }))}
          departmentId={departmentId}
          onDepartmentChange={setDepartmentId}
          gender={gender}
          onGenderChange={setGender}
          onAddPatient={() => setDialogOpen(true)}
        />

        <PatientTable patients={visible} isLoading={isLoading} />
      </div>

      <PatientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="New patient"
        submitLabel="Register patient"
        isSubmitting={create.isPending}
        onSubmit={(values) =>
          create.mutate(values, { onSuccess: () => setDialogOpen(false) })
        }
      />
    </div>
  );
}

export default function PatientsDirectoryPage() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <DashboardHeader title="Patients" />
      <Suspense fallback={<div className="min-h-0 flex-1" />}>
        <PatientsDirectoryBody />
      </Suspense>
    </div>
  );
}
