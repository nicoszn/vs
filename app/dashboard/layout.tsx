import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// Every route under (authed)/ hits this layout.
// This is the real auth gate — DB lookup, not just cookie presence.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
