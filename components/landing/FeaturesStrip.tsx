"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    accent: "var(--color-indigo-bright)",
    label: "Multi-Chain Aggregator",
    desc:
      "Track your entire portfolio across Bitcoin, Ethereum, Solana and 40+ chains — one live dashboard, zero switching.",
    stat: "40+ chains",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    accent: "var(--color-gold)",
    label: "Live Investment Games",
    desc:
      "Compete in real-time prediction markets, portfolio tournaments, and timed yield challenges with real USDT prizes.",
    stat: "$2M+ paid out",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    accent: "var(--color-green)",
    label: "AI Signal Engine",
    desc:
      "On-chain analytics, sentiment scoring, and momentum signals — distilled into actionable plays before the market moves.",
    stat: "83% accuracy",
  },
];

function FeatureCard({
  icon,
  accent,
  label,
  desc,
  stat,
  index,
}: (typeof FEATURES)[0] & { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-card)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.55s ease ${index * 0.12}s, transform 0.55s ease ${index * 0.12}s`,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = accent;
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 24px rgba(0,0,0,0.2)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-border)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: `${accent}1A`,
          color: accent,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <h3
          className="font-display font-semibold text-xl mb-2"
          style={{ color: "var(--color-ghost)" }}
        >
          {label}
        </h3>
        <p
          className="font-body text-sm leading-relaxed"
          style={{ color: "var(--color-muted)" }}
        >
          {desc}
        </p>
      </div>

      {/* Stat pill */}
      <div
        className="font-mono text-xs tracking-wider uppercase self-start px-3 py-1 rounded-full"
        style={{
          background: `${accent}15`,
          color: accent,
          border: `1px solid ${accent}30`,
        }}
      >
        {stat}
      </div>
    </div>
  );
}

export default function FeaturesStrip() {
  return (
    <section
      id="features"
      style={{
        background: "var(--color-deep)",
        padding: "5rem 1rem",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Section header */}
        <div className="text-center mb-14">
          <p
            className="font-mono text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: "var(--color-indigo-bright)" }}
          >
            Platform Core
          </p>
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              color: "var(--color-ghost)",
              lineHeight: 1.15,
            }}
          >
            Built for investors who{" "}
            <span style={{ color: "var(--color-indigo-bright)" }}>play to win.</span>
          </h2>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.label} {...f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
