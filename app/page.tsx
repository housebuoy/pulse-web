import { redirect } from "next/navigation";

// Role routing: in the real system, inspect the session cookie/JWT here,
// then redirect to /d (admin) or /w (doctor). Real enforcement is Spring Boot.
// For now the mock default is the admin dashboard; visit /activate to enter
// the doctor workspace, or navigate directly to /w/queue.
export default function RootPage() {
  redirect("/d/overview");
}
