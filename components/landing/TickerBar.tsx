"use client";

import { useEffect, useRef } from "react";

const TICKER_ITEMS = [
  { label: "BTC/USDT",  value: "$67,342.00", change: "+4.82%",  up: true },
  { label: "ETH/USDT",  value: "$3,892.14",  change: "+3.17%",  up: true },
  { label: "SOL/USDT",  value: "$182.40",    change: "+7.44%",  up: true },
  { label: "BNB/USDT",  value: "$612.88",    change: "+1.20%",  up: true },
  { label: "ARB/USDT",  value: "$1.284",     change: "-1.23%",  up: false },
  { label: "MATIC/USDT",value: "$0.918",     change: "+5.91%",  up: true },
  { label: "AVAX/USDT", value: "$38.72",     change: "+2.65%",  up: true },
  { label: "LINK/USDT", value: "$18.93",     change: "-0.84%",  up: false },
  { label: "INJ/USDT",  value: "$31.47",     change: "+9.12%",  up: true },
  { label: "OP/USDT",   value: "$3.56",      change: "+6.38%",  up: true },
];

// Double for seamless loop
const DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS];

export default function TickerBar() {
  return (
    <div
      className="relative overflow-hidden py-3"
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to right, var(--color-surface), transparent)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to left, var(--color-surface), transparent)",
        }}
      />

      {/* Marquee track */}
      <div
        className="flex gap-8 w-max"
        style={{
          animation: "marquee 36s linear infinite",
          willChange: "transform",
        }}
      >
        {DOUBLED.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 font-mono text-xs whitespace-nowrap"
            style={{ color: "var(--color-muted)" }}
          >
            <span style={{ color: "var(--color-ghost)" }}>{item.label}</span>
            <span>{item.value}</span>
            <span
              style={{
                color: item.up ? "var(--color-green)" : "var(--color-red)",
                fontWeight: 500,
              }}
            >
              {item.up ? "▲" : "▼"} {item.change}
            </span>
            <span
              style={{
                display: "inline-block",
                width: 1,
                height: 12,
                background: "var(--color-border)",
                marginLeft: "0.5rem",
              }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
