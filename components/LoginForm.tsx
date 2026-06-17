"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Error message */}
      {state && !state.success && (
        <div
          className="font-mono text-xs px-4 py-3 rounded-lg"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#EF4444",
          }}
        >
          {state.error}
        </div>
      )}

      {/* Email */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          htmlFor="email"
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            color: "var(--color-ghost)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.875rem",
            outline: "none",
            width: "100%",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-indigo)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
          }}
        />
      </div>

      {/* Password */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          htmlFor="password"
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            padding: "0.75rem 1rem",
            color: "var(--color-ghost)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.875rem",
            outline: "none",
            width: "100%",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "var(--color-indigo)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--color-border)";
          }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        style={{
          marginTop: "0.5rem",
          padding: "0.875rem",
          borderRadius: "0.5rem",
          background: pending ? "var(--color-dim)" : "var(--color-indigo)",
          color: "#fff",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: pending ? "not-allowed" : "pointer",
          border: "none",
          transition: "background 0.2s",
          width: "100%",
        }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <p
        className="font-mono text-xs text-center"
        style={{ color: "var(--color-muted)" }}
      >
        No account?{" "}
        <Link
          href="/register"
          style={{ color: "var(--color-indigo-bright)", textDecoration: "none" }}
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
