"use client";

import { useRef, useState } from "react";

/**
 * Returns [justSaved, markSaved].
 * Call markSaved() in a mutation's onSuccess; the flag auto-clears after 2 s.
 * When isDirty becomes true again (user starts editing) the returned value
 * is `false` automatically — no useEffect needed, just derived state.
 */
export function useJustSaved(isDirty: boolean): [boolean, () => void] {
  const [_saved, setSaved] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const markSaved = () => {
    setSaved(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSaved(false), 2000);
  };

  // Suppress the flash the moment the user starts editing again —
  // derived, not via an effect, so no setState-in-effect cascade.
  const justSaved = _saved && !isDirty;

  return [justSaved, markSaved];
}
