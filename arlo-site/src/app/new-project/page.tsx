import { cookies } from "next/headers";
import { NewProjectForm } from "@/components/new-project/NewProjectForm";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export default async function NewProjectPage() {
  const cookieStore = await cookies();
  // Guaranteed non-null: the layout already redirects to /login otherwise.
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)!;

  return <NewProjectForm userName={session.name} userEmail={session.email} />;
}
