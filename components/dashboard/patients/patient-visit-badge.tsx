import { StatusBadge } from "@/components/dashboard/status-badge";
import { isHereToday, visitTone } from "@/lib/patient-utils";
import type { Patient } from "@/lib/types/patients";

export function PatientVisitBadge({ patient }: { patient: Patient }) {
  if (!isHereToday(patient) || !patient.currentVisit) {
    return <StatusBadge tone="neutral" label="Registered" dot />;
  }
  return (
    <StatusBadge
      tone={visitTone(patient.currentVisit.status)}
      label={`Currently here · ${patient.currentVisit.departmentName}`}
      dot
    />
  );
}
