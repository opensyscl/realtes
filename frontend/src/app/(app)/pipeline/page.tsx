import { redirect } from "next/navigation";

// El pipeline es la vista kanban de leads.
export default function PipelinePage() {
  redirect("/leads");
}
