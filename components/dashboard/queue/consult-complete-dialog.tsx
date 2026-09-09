"use client";

// Consult completion dialog — opened from the "Complete" button on a serving
// patient's card. Records the outcome of the consultation (POST
// /queue/entries/{id}/complete): symptoms, visit note, recommendations and an
// optional prescription list. Kept in the queue domain because it finishes a
// queue entry; the backend persists the clinical records from the same call.
//
// The form is keyed by entry id so each consultation starts with a clean
// slate — no manual reset effect required.

import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCompleteConsult } from "@/hooks/use-queue";
import type { CompleteConsultInput } from "@/lib/types/queue";
import type { QueueEntry } from "@/lib/types/queue";

/** One row of the dynamic prescription list (untrimmed draft state). */
interface PrescriptionDraft {
  medication: string;
  dose: string;
  instructions: string;
}

const emptyRx = (): PrescriptionDraft => ({
  medication: "",
  dose: "",
  instructions: "",
});

export function ConsultCompleteDialog({
  entry,
  onClose,
}: {
  entry: QueueEntry | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={Boolean(entry)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Complete consultation</DialogTitle>
          <DialogDescription>
            {entry
              ? `Record the outcome for ${entry.ticketNumber} — ${entry.patientName}.`
              : "Record the outcome for this consultation."}
          </DialogDescription>
        </DialogHeader>

        {entry && (
          <ConsultCompleteForm key={entry.id} entry={entry} onDone={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConsultCompleteForm({
  entry,
  onDone,
}: {
  entry: QueueEntry;
  onDone: () => void;
}) {
  const complete = useCompleteConsult();

  const [symptoms, setSymptoms] = useState("");
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [prescriptions, setPrescriptions] = useState<PrescriptionDraft[]>([]);

  const updateRx = (index: number, patch: Partial<PrescriptionDraft>) =>
    setPrescriptions((rows) =>
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    );

  const removeRx = (index: number) =>
    setPrescriptions((rows) => rows.filter((_, i) => i !== index));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || complete.isPending) return;

    const completePrescriptions = prescriptions
      .filter((p) => p.medication.trim() && p.dose.trim())
      .map((p) => ({
        medication: p.medication.trim(),
        dose: p.dose.trim(),
        ...(p.instructions.trim() ? { instructions: p.instructions.trim() } : {}),
      }));

    const input: CompleteConsultInput = {
      symptoms: symptoms.trim(),
      ...(summary.trim() ? { summary: summary.trim() } : {}),
      ...(recommendations.trim()
        ? { recommendations: recommendations.trim() }
        : {}),
      ...(completePrescriptions.length > 0
        ? { prescriptions: completePrescriptions }
        : {}),
    };

    complete.mutate(
      { entryId: entry.id, input },
      {
        onSuccess: () => {
          toast.success("Consultation completed");
          onDone();
        },
        onError: (error) => {
          const serverMessage = isAxiosError(error)
            ? (error.response?.data as { message?: string } | undefined)
                ?.message
            : undefined;
          toast.error(
            serverMessage ?? "Could not complete the consultation",
          );
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-fg">Symptoms</span>
        <Textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="Chief complaint, history of present illness…"
          rows={3}
          required
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-fg">
          Notes / summary <span className="text-fg-placeholder">(optional)</span>
        </span>
        <Textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Examination findings, assessment, plan…"
          rows={3}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-fg">
          Recommendations <span className="text-fg-placeholder">(optional)</span>
        </span>
        <Textarea
          value={recommendations}
          onChange={(e) => setRecommendations(e.target.value)}
          placeholder="Follow-up, lifestyle advice, referrals…"
          rows={2}
        />
      </label>

      <div className="space-y-2">
        <span className="text-sm font-medium text-fg">Prescriptions</span>
        {prescriptions.length === 0 && (
          <p className="text-xs text-fg-muted">
            No prescriptions — add one if this visit ends with a new
            medication.
          </p>
        )}
        {prescriptions.map((rx, index) => (
          <div
            key={index}
            className="space-y-2 rounded-lg border border-border bg-surface-muted/60 p-3"
          >
            <div className="flex items-end gap-2">
              <label className="min-w-0 flex-1 space-y-1">
                <span className="text-xs font-medium text-fg">Medication</span>
                <Input
                  value={rx.medication}
                  onChange={(e) =>
                    updateRx(index, { medication: e.target.value })
                  }
                  placeholder="e.g. Amoxicillin"
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeRx(index)}
                aria-label={`Remove ${rx.medication.trim() || "prescription"}`}
              >
                <Trash2 className="size-4 text-fg-muted" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-medium text-fg">Dose</span>
                <Input
                  value={rx.dose}
                  onChange={(e) => updateRx(index, { dose: e.target.value })}
                  placeholder="e.g. 500 mg twice daily"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-fg">
                  Instructions{" "}
                  <span className="text-fg-placeholder">(optional)</span>
                </span>
                <Input
                  value={rx.instructions}
                  onChange={(e) =>
                    updateRx(index, { instructions: e.target.value })
                  }
                  placeholder="e.g. With food"
                />
              </label>
            </div>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setPrescriptions((rows) => [...rows, emptyRx()])}
        >
          <Plus className="size-3.5" /> Add medication
        </Button>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onDone}
          disabled={complete.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={complete.isPending || !symptoms.trim()}
        >
          {complete.isPending ? "Completing…" : "Complete consultation"}
        </Button>
      </DialogFooter>
    </form>
  );
}
