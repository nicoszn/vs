"use client";

import { useState } from "react";
import Link from "next/link";

export default function CTASection() {
  const [hover, setHover] = useState(false);

  return (
    <section
      style={{
        background: "var(--color-deep)",
        padding: "6rem 1rem",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div
        className="gradient-border text-center mx-auto"
        style={{
          maxWidth: "680px",
          borderRadius: "1.25rem",
          padding: "3.5rem 2.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, rgba(91,79,232,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
          aria-hidden
        />

        <p
          className="font-mono text-xs tracking-[0.25em] uppercase mb-5"
          style={{ color: "var(--color-indigo-bright)" }}
        >
          Get Early Access
        </p>

        <h2
          className="font-display font-bold mb-4"
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            color: "var(--color-ghost)",
            lineHeight: 1.15,
          }}
        >
          Ready to play at the
          <br />
          <span style={{ color: "var(--color-gold)" }} className="text-glow-gold">
            highest level?
          </span>
        </h2>

        <p
          className="font-body text-sm leading-relaxed mb-10"
          style={{ color: "var(--color-muted)", maxWidth: "400px", margin: "0 auto 2.5rem" }}
        >
          Join the beta. Experience live games, real crypto rewards, and a
          dashboard that thinks as fast as you do.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/demo"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.875rem 2.25rem",
              borderRadius: "9999px",
              background: hover ? "var(--color-indigo-bright)" : "var(--color-indigo)",
              color: "#fff",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "1rem",
              textDecoration: "none",
              transition: "background 0.25s, box-shadow 0.25s, transform 0.2s",
              boxShadow: hover
                ? "0 0 36px rgba(91,79,232,0.55)"
                : "0 0 18px rgba(91,79,232,0.3)",
              transform: hover ? "translateY(-2px)" : "translateY(0)",
            }}
          >
            Try Demo Free
          </Link>

          <span
            className="font-mono text-xs"
            style={{ color: "var(--color-dim)" }}
          >
            No wallet needed · 2 min setup
          </span>
        </div>

        {/* Trust badges */}
        <div
          className="flex items-center justify-center gap-6 mt-10"
          style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem" }}
        >
          {["Non-custodial", "Audited contracts", "Open beta"].map((t) => (
            <span
              key={t}
              className="font-mono text-xs flex items-center gap-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
