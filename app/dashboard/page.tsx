import { getSession } from "@/lib/session";
import { logoutAction } from "@/lib/actions";

export default async function DashboardPage() {
  // Session is already validated by the layout, but we fetch user data here
  // for display. getSession() is cheap — it reads from the same cookie.
  const user = await getSession();

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--color-void)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "1rem",
          padding: "2.5rem 3rem",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
        }}
      >
        <p
          className="font-mono text-xs tracking-widest uppercase mb-4"
          style={{ color: "var(--color-indigo-bright)" }}
        >
          Authenticated
        </p>

        <h1
          className="font-display font-bold text-3xl mb-2"
          style={{ color: "var(--color-ghost)" }}
        >
          Welcome back, {user!.name}
        </h1>

        <p
          className="font-mono text-sm mb-8"
          style={{ color: "var(--color-muted)" }}
        >
          {user!.email}
        </p>

        <form action={logoutAction}>
          <button
            type="submit"
            className="font-mono text-sm px-6 py-2.5 rounded-full w-full"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-ghost)",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
