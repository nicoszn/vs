"use client";

import { useState, useEffect, useRef } from "react";

const WINNERS_POOL = [
  { handle: "@0xNirvana",    amount: "14,400", asset: "USDT",  game: "BTC Prediction",       flag: "🇳🇬" },
  { handle: "@cryptorajput", amount: "8,750",  asset: "USDT",  game: "Yield Tournament",     flag: "🇮🇳" },
  { handle: "@veloscout",    amount: "22,100", asset: "USDT",  game: "Portfolio Challenge",  flag: "🇺🇸" },
  { handle: "@degenqueen",   amount: "5,500",  asset: "USDT",  game: "ETH Momentum Race",    flag: "🇧🇷" },
  { handle: "@blocksmith_k", amount: "31,800", asset: "USDT",  game: "Jackpot Round #44",    flag: "🇰🇷" },
  { handle: "@satoshi_fan",  amount: "7,200",  asset: "USDT",  game: "BTC Prediction",       flag: "🇩🇪" },
  { handle: "@alphawolf",    amount: "18,900", asset: "USDT",  game: "Altcoin Sprint",        flag: "🇿🇦" },
  { handle: "@pumpmaster",   amount: "3,420",  asset: "USDT",  game: "Quick Draw Round",     flag: "🇨🇦" },
];

// Map of winner cards shown recently (rotating)
function useWinnerFeed(interval = 3200) {
  const [visible, setVisible] = useState<typeof WINNERS_POOL>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    // seed initial 3
    setVisible(WINNERS_POOL.slice(0, 3));
    indexRef.current = 3;

    const t = setInterval(() => {
      const next = WINNERS_POOL[indexRef.current % WINNERS_POOL.length];
      indexRef.current++;
      setVisible((prev) => [next, ...prev.slice(0, 4)]);
    }, interval);

    return () => clearInterval(t);
  }, [interval]);

  return visible;
}

function WinnerCard({
  handle,
  amount,
  asset,
  game,
  flag,
  isNew,
}: (typeof WINNERS_POOL)[0] & { isNew: boolean }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        animation: isNew ? "slide-in-right 0.45s cubic-bezier(0.2, 0.8, 0.4, 1) forwards" : "none",
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Avatar placeholder */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {flag}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="font-mono text-xs font-medium truncate"
          style={{ color: "var(--color-ghost)" }}
        >
          {handle}
        </p>
        <p
          className="font-mono text-xs truncate"
          style={{ color: "var(--color-muted)" }}
        >
          {game}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p
          className="font-mono text-sm font-medium"
          style={{
            color: "var(--color-gold)",
            textShadow: isNew ? "0 0 12px rgba(245,197,66,0.5)" : "none",
            transition: "text-shadow 0.6s ease",
          }}
        >
          +${amount}
        </p>
        <p
          className="font-mono text-xs"
          style={{ color: "var(--color-muted)" }}
        >
          {asset}
        </p>
      </div>
    </div>
  );
}

export default function WinnersFeed() {
  const winners = useWinnerFeed(3200);

  return (
    <section
      style={{
        background: "var(--color-void)",
        padding: "5rem 1rem",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
        className="grid-cols-stack"
      >
        {/* Left: copy */}
        <div style={{ maxWidth: "480px" }}>
          <p
            className="font-mono text-xs tracking-[0.25em] uppercase mb-4"
            style={{ color: "var(--color-gold)" }}
          >
            Live Payouts
          </p>
          <h2
            className="font-display font-bold mb-5"
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              color: "var(--color-ghost)",
              lineHeight: 1.15,
            }}
          >
            Real winners.
            <br />
            Real money.
            <br />
            <span style={{ color: "var(--color-gold)" }} className="text-glow-gold">
              Right now.
            </span>
          </h2>
          <p
            className="font-body text-sm leading-relaxed mb-8"
            style={{ color: "var(--color-muted)" }}
          >
            Every payout is on-chain verifiable. No smoke, no mirrors — just
            live settlement in USDT to verified wallets. The feed updates as
            rounds close.
          </p>

          {/* Stats row */}
          <div className="flex gap-8">
            {[
              { v: "$2.4M+", l: "Total paid out" },
              { v: "12K+",   l: "Active players" },
              { v: "99.97%", l: "Uptime" },
            ].map((s) => (
              <div key={s.l}>
                <p
                  className="font-display font-bold text-2xl"
                  style={{ color: "var(--color-ghost)" }}
                >
                  {s.v}
                </p>
                <p
                  className="font-mono text-xs"
                  style={{ color: "var(--color-muted)" }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: live feed */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* Live badge */}
          <div
            className="self-start flex items-center gap-2 font-mono text-xs px-3 py-1.5 rounded-full mb-1"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--color-green)",
                boxShadow: "0 0 6px var(--color-green)",
                animation: "pulse-ring 1.4s ease-out infinite",
              }}
            />
            Live feed
          </div>

          {winners.map((w, i) => (
            <WinnerCard key={`${w.handle}-${i}`} {...w} isNew={i === 0} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .grid-cols-stack {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
