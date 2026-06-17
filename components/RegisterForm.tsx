"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/lib/actions";

const inputStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  padding: "0.75rem 1rem",
  color: "var(--color-ghost)",
  fontFamily: "var(--font-mono)",
  fontSize: "0.875rem",
  outline: "none",
  width: "100%",
} as const;

export default function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, null);
  const router = useRouter();

  // Watch action state changes to route cleanly without breaking runtime frames
  useEffect(() => {
    if (!state) return;

    if (state.success) {
      router.push("/dashboard");
    } else if (state.redirectToHome) {
      router.push("/");
    }
  }, [state, router]);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {state && !state.success && state.error && (
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

      {/* Name */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <label
          htmlFor="name"
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--color-muted)" }}
        >
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Nick Obi"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-indigo)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
      </div>

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
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-indigo)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
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
          <span
            className="ml-2 normal-case"
            style={{ color: "var(--color-dim)", fontWeight: 400 }}
          >
            (min 8 chars)
          </span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="••••••••"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "var(--color-indigo)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
        />
      </div>

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
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p
        className="font-mono text-xs text-center"
        style={{ color: "var(--color-muted)" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          style={{ color: "var(--color-indigo-bright)", textDecoration: "none" }}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
