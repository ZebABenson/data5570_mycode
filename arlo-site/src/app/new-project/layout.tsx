import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DemoProvider } from "@/components/demo/DemoProvider";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

// This route reads the session cookie to gate access, so it can never be
// part of the static prerendered shell -- it must run per-request.
export const instant = false;

export default async function NewProjectLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);

  if (!session) {
    redirect("/login");
  }

  return <DemoProvider>{children}</DemoProvider>;
}
