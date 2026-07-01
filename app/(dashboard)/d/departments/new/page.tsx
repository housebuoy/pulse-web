import { redirect } from "next/navigation";

// The "Add department" flow now opens an in-page modal on /d/departments.
// Keep this route so old bookmarks don't 404.
export default function NewDepartmentPage() {
  redirect("/d/departments");
}
