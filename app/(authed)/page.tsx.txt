"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Simulated portfolio data
const ASSETS = [
  { symbol: "BTC",  name: "Bitcoin",  amount: "0.428",  price: 67342,  change: 4.82,   color: "#F7931A" },
  { symbol: "ETH",  name: "Ethereum", amount: "3.12",   price: 3892,   change: 3.17,   color: "#627EEA" },
  { symbol: "SOL",  name: "Solana",   amount: "24.0",   price: 182.4,  change: 7.44,   color: "#9945FF" },
  { symbol: "ARB",  name: "Arbitrum", amount: "1840",   price: 1.284,  change: -1.23,  color: "#2D374B" },
];

const ACTIVE_GAMES = [
  { name: "BTC Prediction Round #82", prize: "$12,000", ends: "04:22", players: 344,  type: "prediction" },
  { name: "Yield Tournament Q3",      prize: "$40,000", ends: "22:11", players: 1204, type: "tournament" },
  { name: "ETH Speed Sprint",         prize: "$5,000",  ends: "01:44", players: 89,   type: "sprint" },
];

function useCountdown(startSeconds: number) {
  const [secs, setSecs] = useState(startSeconds);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : startSeconds)), 1000);
    return () => clearInterval(t);
  }, [startSeconds]);
  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function NavBar() {
  return (
    <nav
      className="flex items-center justify-between px-6 h-14 flex-shrink-0"
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        paddingInline: "1rem"
      }}
    >
      <div className="flex items-center gap-3">
        <Link
          href="/"
          style={{
            color: "var(--color-muted)",
            textDecoration: "none",
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </Link>
        <span style={{ color: "var(--color-border)" }}>|</span>
        <span
          className="font-display font-bold text-lg"
          style={{ color: "var(--color-ghost)" }}
        >
          Invex
        </span>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded-full"
          style={{ background: "var(--color-indigo)", color: "#fff", padding: "0.25rem 0.5rem" }}
        >
          Demo
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: "var(--color-green)", boxShadow: "0 0 6px var(--color-green)" }}
        />
        <span className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
          Simulated · No real funds
        </span>
      </div>
    </nav>
  );
}

function PortfolioCard() {
  const total = ASSETS.reduce((acc, a) => acc + parseFloat(a.amount) * a.price, 0);

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        padding: "1.25rem"
      }}
    >
      <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: "var(--color-muted)", marginBottom: "0.25rem" }}>
        Total Portfolio Value
      </p>
      <p
        className="font-display font-bold mb-4"
        style={{ fontSize: "2.2rem", color: "var(--color-ghost)", marginBottom: "1rem"}}
      >
        ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>

      <div className="flex flex-col gap-2.5">
        {ASSETS.map((a) => {
          const value = parseFloat(a.amount) * a.price;
          const pct = (value / total) * 100;
          return (
            <div key={a.symbol} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-mono text-xs font-bold"
                style={{ background: `${a.color}30`, color: a.color }}
              >
                {a.symbol[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs" style={{ color: "var(--color-ghost)", marginBottom: "0.25rem" }}>
                    {a.symbol}
                  </span>
                  <span
                    className="font-mono text-xs"
                    style={{ color: a.change >= 0 ? "var(--color-green)" : "var(--color-red)" }}
                  >
                    {a.change >= 0 ? "+" : ""}{a.change}%
                  </span>
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: "var(--color-border)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: a.color,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>
              <span className="font-mono text-xs w-20 text-right flex-shrink-0" style={{ color: "var(--color-muted)" }}>
                ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GameCard({ name, prize, ends, players, type }: (typeof ACTIVE_GAMES)[0]) {
  const GAME_SEED = { prediction: 262, tournament: 1323, sprint: 104 }[type] ?? 300;
  const timeLeft = useCountdown(GAME_SEED);

  const typeColor = { prediction: "var(--color-indigo-bright)", tournament: "var(--color-gold)", sprint: "var(--color-green)" }[type];

  return (
    <div
      className="rounded-xl p-4 flex items-center gap-4"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        transition: "border-color 0.2s",
        padding: "1rem"
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = typeColor ?? "var(--color-indigo)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
    >
      <div
        className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{ background: `${typeColor}18` }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={typeColor} strokeWidth="1.8" strokeLinecap="round">
          {type === "prediction" && <path d="M22 12h-4l-3 9L9 3l-3 9H2" />}
          {type === "tournament" && <><circle cx="12" cy="8" r="6"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></>}
          {type === "sprint" && <><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></>}
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs font-medium truncate mb-1" style={{ color: "var(--color-ghost)", marginBottom: "0.25rem" }}>
          {name}
        </p>
        <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
          {players.toLocaleString()} players
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-display font-semibold text-sm" style={{ color: typeColor }}>
          {prize}
        </p>
        <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
          {timeLeft} left
        </p>
      </div>

      <button
        className="font-mono text-xs px-3 py-1.5 rounded-lg flex-shrink-0"
        style={{
          background: `${typeColor}20`,
          color: typeColor,
          border: `1px solid ${typeColor}40`,
          cursor: "pointer",
          padding: "0.5rem 0.75rem"
        }}
      >
        Join
      </button>
    </div>
  );
}

export default function DemoPage() {
  return (
    <div
      className="invex-root"
      style={{ background: "var(--color-void)", minHeight: "100dvh" }}
    >
      <NavBar />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Welcome banner */}
        <div
          className="rounded-xl px-5 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, rgba(91,79,232,0.12) 0%, rgba(245,197,66,0.06) 100%)",
            border: "1px solid var(--color-border)",
            padding: "1rem 1.25rem",
          }}
        >
          <div>
            <p className="font-display font-semibold text-lg" style={{ color: "var(--color-ghost)" }}>
              Welcome to your Demo Dashboard
            </p>
            <p className="font-mono text-xs mt-1" style={{ color: "var(--color-muted)" }}>
              All values are simulated · Real product coming soon
            </p>
          </div>
          <span
            className="font-mono text-xs px-3 py-1.5 rounded-full"
            style={{
              background: "var(--color-gold)",
              color: "var(--color-void)",
              fontWeight: 600,
              padding: "0.4rem 0.75rem",
            }}
          >
            Beta Access
          </span>
        </div>

        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "340px 1fr",
            gap: "1.5rem",
          }}
          className="demo-grid"
        >
          {/* Left: portfolio */}
          <PortfolioCard />

          {/* Right: active games */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-display font-semibold text-lg" style={{ color: "var(--color-ghost)", marginBottom: "0.25rem", }}>
                Live Games
              </p>
              <span
                className="flex items-center gap-1.5 font-mono text-xs"
                style={{ color: "var(--color-green)" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--color-green)", boxShadow: "0 0 5px var(--color-green)" }}
                />
                3 active now
              </span>
            </div>
            {ACTIVE_GAMES.map((g) => (
              <GameCard key={g.name} {...g} />
            ))}

            {/* Placeholder for more */}
            <div
              className="rounded-xl p-4 text-center"
              style={{
                background: "var(--color-card)",
                border: "1px dashed var(--color-border)",
                padding: "1rem",
              }}
            >
              <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
                12 more games launching this week →
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .demo-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
