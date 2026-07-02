import { redirect } from "next/navigation";

// /w root → default to the primary queue view.
export default function WorkspaceRootPage() {
  redirect("/w/queue");
}
