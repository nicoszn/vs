import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main
      className="invex-root grid-noise"
      style={{
        minHeight: "100dvh",
        background: "var(--color-void)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <span
            className="font-display font-bold text-2xl"
            style={{ color: "var(--color-ghost)" }}
          >
            Invex
          </span>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "1rem",
            padding: "2rem",
          }}
        >
          <h1
            className="font-display font-bold text-2xl mb-1"
            style={{ color: "var(--color-ghost)" }}
          >
            {title}
          </h1>
          <p
            className="font-mono text-sm mb-6"
            style={{ color: "var(--color-muted)" }}
          >
            {subtitle}
          </p>

          {children}
        </div>
      </div>
    </main>
  );
}
