"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ConfettiExplosion from "./ConfettiExplosion";

// ── Simulated jackpot amounts that cycle ──────────────────
const JACKPOT_AMOUNTS = [
  "847,291",
  "1,204,500",
  "523,880",
  "2,091,337",
  "389,042",
  "1,758,600",
  "944,211",
];

const CRYPTO_TICKERS = [
  { symbol: "BTC", change: "+4.82%", positive: true },
  { symbol: "ETH", change: "+3.17%", positive: true },
  { symbol: "SOL", change: "+7.44%", positive: true },
  { symbol: "ARB",  change: "-1.23%", positive: false },
  { symbol: "MATIC", change: "+5.91%", positive: true },
];

// ── Ambient floating particles ────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

function useParticles(count: number): Particle[] {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      "rgba(91,79,232,0.6)",
      "rgba(245,197,66,0.5)",
      "rgba(91,79,232,0.3)",
      "rgba(34,197,94,0.4)",
    ];
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 6 + 4,
        delay: Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    );
  }, [count]);

  return particles;
}

// ── Slot-machine digit component ──────────────────────────
function SlotDigit({ value, prevValue }: { value: string; prevValue: string }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (value !== prevValue) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 400);
      return () => clearTimeout(t);
    }
  }, [value, prevValue]);

  return (
    <span
      className="inline-block overflow-hidden relative"
      style={{ minWidth: value === "," ? "0.3em" : "0.65em", textAlign: "center" }}
    >
      <span
        style={{
          display: "inline-block",
          animation: animating && value !== ","
            ? "slot-spin 0.35s cubic-bezier(0.4,0,0.2,1)"
            : "none",
          color: animating ? "var(--color-gold)" : undefined,
          transition: "color 0.4s ease",
        }}
      >
        {value}
      </span>
    </span>
  );
}

// ── Main jackpot number display ───────────────────────────
function JackpotCounter() {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(index);
      setIndex((i) => (i + 1) % JACKPOT_AMOUNTS.length);
      setShowConfetti(true);
      setConfettiKey((k) => k + 1);
      setTimeout(() => setShowConfetti(false), 2200);
    }, 3500);
    return () => clearInterval(interval);
  }, [index]);

  const current = JACKPOT_AMOUNTS[index];
  const prev = JACKPOT_AMOUNTS[prevIndex];

  return (
    <div className="relative flex flex-col items-center py-2">
      {/* Confetti burst above the number */}
      <div
        className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {showConfetti && <ConfettiExplosion key={confettiKey} />}
      </div>

      {/* Label */}
      <p
        className="font-mono text-xs tracking-[0.25em] uppercase mb-3"
        style={{ color: "var(--color-muted)" }}
      >
        Latest Jackpot Payout
      </p>

      {/* Amount */}
      <div
        className="font-display font-bold leading-none"
        style={{
          fontSize: "clamp(3rem, 8vw, 6.5rem)",
          color: "var(--color-gold)",
        }}
      >
        <span style={{ fontSize: "0.45em", verticalAlign: "super", opacity: 0.8 }}>$</span>
        {current.split("").map((char, i) => (
          <SlotDigit
            key={i}
            value={char}
            prevValue={i < prev.length ? prev[i] : ""}
          />
        ))}
      </div>

      {/* USD label */}
      <p
        className="font-mono text-xs tracking-widest mt-2 uppercase"
        style={{ color: "var(--color-gold-dim)" }}
      >
        USDT equivalent · live payouts
      </p>
    </div>
  );
}

// ── Crypto mini-ticker ────────────────────────────────────
function CryptoPill({
  symbol,
  change,
  positive,
}: {
  symbol: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-xs"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        color: positive ? "var(--color-green)" : "var(--color-red)",
        padding: "0.4rem 0.8rem"
      }}
    >
      <span style={{ color: "var(--color-ghost)" }}>{symbol}</span>
      <span>{change}</span>
    </div>
  );
}

// ── Hero CTA Button ───────────────────────────────────────
function HeroCTA() {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href="/demo"
      className="relative inline-flex items-center gap-3 font-display font-semibold text-lg select-none"
      style={{
        padding: "1rem 2.5rem",
        borderRadius: "var(--radius-pill)",
        background: hovered
          ? "var(--color-indigo-bright)"
          : "var(--color-indigo)",
        color: "#fff",
        textDecoration: "none",
        transition: "background 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease",
        boxShadow: hovered
          ? "0 0 36px rgba(91,79,232,0.55), 0 8px 24px rgba(0,0,0,0.4)"
          : "0 0 18px rgba(91,79,232,0.3), 0 4px 12px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          background: "var(--color-green)",
          animation: "pulse-ring 1.4s ease-out infinite",
        }}
      />
      Try Demo
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "transform 0.2s ease",
          transform: hovered ? "translateX(4px)" : "translateX(0)",
        }}
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

// ── Ambient Orbs ──────────────────────────────────────────
function AmbientOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {/* Large indigo orb top-left */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "55vw",
          height: "55vw",
          maxWidth: "700px",
          maxHeight: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,79,232,0.18) 0%, transparent 70%)",
          animation: "orb-pulse 7s ease-in-out infinite",
        }}
      />
      {/* Gold orb bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-8%",
          width: "45vw",
          height: "45vw",
          maxWidth: "560px",
          maxHeight: "560px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(245,197,66,0.12) 0%, transparent 70%)",
          animation: "orb-pulse 9s ease-in-out infinite 2s",
        }}
      />
      {/* Small indigo accent mid-right */}
      <div
        style={{
          position: "absolute",
          top: "40%",
          right: "10%",
          width: "20vw",
          height: "20vw",
          maxWidth: "260px",
          maxHeight: "260px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,79,232,0.12) 0%, transparent 70%)",
          animation: "orb-pulse 5s ease-in-out infinite 1s",
        }}
      />
    </div>
  );
}

// ── Main HeroSection ──────────────────────────────────────
export default function HeroSection() {
  const particles = useParticles(18);

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-dvh grid-noise"
      style={{
        background: "var(--color-void)",
        padding: "2rem 1rem",
        textAlign: "center",
      }}
    >
      <AmbientOrbs />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              animation: `float ${p.duration}s ease-in-out infinite ${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div
        className="relative flex flex-col items-center gap-8 w-full"
        style={{ maxWidth: "860px", zIndex: 1 }}
      >
        {/* Status badge */}
        <div
          className="inline-flex items-center gap-2 font-mono text-xs tracking-widest uppercase px-4 py-2 rounded-full"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
            padding: "0.50rem 1rem",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--color-green)",
              boxShadow: "0 0 6px var(--color-green)",
            }}
          />
          Live · Beta Access Open
        </div>

        {/* Headline */}
        <h1
          className="font-display font-bold leading-[1.05] tracking-tight"
          style={{
            fontSize: "clamp(2.4rem, 7vw, 5.5rem)",
            color: "var(--color-ghost)",
          }}
        >
          Where{" "}
          <span className="shimmer-text">Investment</span>
          <br />
          Meets the{" "}
          <span style={{ color: "var(--color-indigo-bright)" }} className="text-glow-indigo">
            Game.
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          className="font-body leading-relaxed"
          style={{
            fontSize: "clamp(1rem, 2.2vw, 1.25rem)",
            color: "var(--color-muted)",
            maxWidth: "560px",
          }}
        >
          Aggregate crypto assets, compete in live investment challenges,
          and claim real rewards — all from a single dashboard built for
          serious players.
        </p>

        {/* Jackpot counter */}
        <div
          className="w-full rounded-2xl py-8 px-6"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            maxWidth: "520px",
            padding: "1.5rem 2rem",
          }}
        >
          <JackpotCounter />
        </div>

        {/* Live crypto pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CRYPTO_TICKERS.map((t) => (
            <CryptoPill key={t.symbol} {...t} />
          ))}
        </div>

        {/* CTA row */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <HeroCTA />
          <a
            href="#features"
            className="font-mono text-sm tracking-wide"
            style={{ color: "var(--color-muted)", textDecoration: "none" }}
          >
            See how it works ↓
          </a>
        </div>

        {/* Social proof */}
        <p
          className="font-mono text-xs"
          style={{ color: "var(--color-dim)" }}
        >
          Joined by{" "}
          <span style={{ color: "var(--color-ghost)" }}>12,400+</span> investors
          across{" "}
          <span style={{ color: "var(--color-ghost)" }}>47</span> countries
        </p>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: 0.4, animation: "float 2s ease-in-out infinite" }}
        aria-hidden
      >
        <div
          className="w-px h-8"
          style={{ background: "linear-gradient(to bottom, transparent, var(--color-border))" }}
        />
        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
          <path d="M1 1l6 6 6-6" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
    </section>
  );
}
