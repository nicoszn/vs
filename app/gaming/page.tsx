"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";

// ── Mock game data ────────────────────────────────────────
const GAMES = [
  {
    id: "crash",
    name: "Crash",
    tag: "HOT",
    tagColor: "#EF4444",
    desc: "Watch the multiplier climb. Cash out before it crashes.",
    players: 1204,
    maxWin: "1000x",
    color: "#5B4FE8",
    icon: "🚀",
    href: "/gaming/crash",
  },
  {
    id: "plinko",
    name: "Plinko",
    tag: "NEW",
    tagColor: "#22C55E",
    desc: "Drop the ball. Watch it bounce to your fortune.",
    players: 876,
    maxWin: "500x",
    color: "#F59E0B",
    icon: "🎯",
    href: "/gaming/plinko",
  },
  {
    id: "dice",
    name: "Dice",
    tag: "CLASSIC",
    tagColor: "#6B7280",
    desc: "Set your number, set your risk. Roll and win.",
    players: 2341,
    maxWin: "99x",
    color: "#10B981",
    icon: "🎲",
    href: "/gaming/dice",
  },
  {
    id: "mines",
    name: "Mines",
    tag: "STRATEGY",
    tagColor: "#8B5CF6",
    desc: "Uncover gems. Dodge the mines. How far will you go?",
    players: 543,
    maxWin: "2000x",
    color: "#EC4899",
    icon: "💎",
    href: "/gaming/mines",
  },
];

const LIVE_WINS = [
  { user: "0xNirv…a", game: "Crash", amount: "+$14,400", multi: "144x", color: "#22C55E" },
  { user: "velo…ut", game: "Mines", amount: "+$8,200", multi: "82x", color: "#22C55E" },
  { user: "degen…en", game: "Plinko", amount: "+$3,100", multi: "31x", color: "#22C55E" },
  { user: "alpha…lf", game: "Dice", amount: "+$920", multi: "9.2x", color: "#22C55E" },
  { user: "block…th", game: "Crash", amount: "-$500", multi: "BUST", color: "#EF4444" },
  { user: "pump…er", game: "Mines", amount: "+$22,000", multi: "220x", color: "#22C55E" },
];

// ── Hero banner images — your 3 uploads go here ──────────
// Replace the src values with your actual image paths under /public/
const HERO_IMAGES = [
  { src: "/images/balls.WEBP", alt: "Crypto gaming hero 1" },
  { src: "/images/bchart.WEBP", alt: "Crypto gaming hero 2" },
  { src: "/images/dice.JPG", alt: "Crypto gaming hero 3" },
];

function HeroBanner() {
  const [active, setActive] = useState(0);

  return (
    <div style={{ position: "relative", width: "100%", marginBottom: "3rem" }}>
      {/* Slides */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "340px",
          borderRadius: "1.25rem",
          overflow: "hidden",
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.45 }}
            style={{ position: "absolute", inset: 0 }}
          >
            {/* Slot for your image — replace with <Image /> once you have files */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(135deg, var(--color-surface) 0%, var(--color-card) 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
            
                  <Image
                    src={HERO_IMAGES[active].src}
                    alt={HERO_IMAGES[active].alt}
                    fill
                    style={{ objectFit: "cover" }}
                    priority
                  />
              
              <span style={{ fontSize: "4rem" }}>
                {active === 0 ? "🚀" : active === 1 ? "💎" : "🎰"}
              </span>
              <p
                className="font-mono text-xs uppercase tracking-widest"
                style={{ color: "var(--color-muted)" }}
              >
                Image slot {active + 1} — drop your image at{" "}
                <code style={{ color: "var(--color-indigo-bright)" }}>
                  /public{HERO_IMAGES[active].src}
                </code>
              </p>
            </div>

            {/* Overlay gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(8,11,20,0.85) 0%, transparent 60%)",
                pointerEvents: "none",
              }}
            />

            {/* Text overlay */}
            <div
              style={{
                position: "absolute",
                bottom: "1.75rem",
                left: "2rem",
              }}
            >
              <p
                className="font-display font-bold"
                style={{
                  fontSize: "1.75rem",
                  color: "#fff",
                  textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                }}
              >
                {active === 0
                  ? "Play Crash — Win Big"
                  : active === 1
                  ? "Mine Gems, Avoid Bombs"
                  : "Plinko Drops Every Second"}
              </p>
              <p
                className="font-mono text-sm"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {active === 0
                  ? "Up to 1000x multiplier · Live now"
                  : active === 1
                  ? "2000x max win · Strategy game"
                  : "500x jackpot · Instant play"}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div
          style={{
            position: "absolute",
            bottom: "1.25rem",
            right: "1.5rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: i === active ? "1.5rem" : "0.5rem",
                height: "0.5rem",
                borderRadius: "9999px",
                background: i === active ? "var(--color-indigo-bright)" : "rgba(255,255,255,0.3)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function LiveFeed() {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid var(--color-border)",
        borderBottom: "1px solid var(--color-border)",
        overflow: "hidden",
        position: "relative",
        marginBottom: "3rem",
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4rem",
          background: "linear-gradient(to right, var(--color-surface), transparent)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "4rem",
          background: "linear-gradient(to left, var(--color-surface), transparent)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ display: "flex", gap: "2rem", padding: "0.75rem 1rem", width: "max-content" }}
      >
        {[...LIVE_WINS, ...LIVE_WINS].map((w, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              whiteSpace: "nowrap",
            }}
          >
            <span
              className="font-mono text-xs"
              style={{ color: "var(--color-muted)" }}
            >
              {w.user}
            </span>
            <span
              className="font-mono text-xs"
              style={{ color: "var(--color-dim)" }}
            >
              {w.game}
            </span>
            <span
              className="font-mono text-xs font-semibold"
              style={{ color: w.color }}
            >
              {w.amount}
            </span>
            <span
              className="font-mono text-xs"
              style={{
                color: w.color,
                background: `${w.color}15`,
                padding: "0.1rem 0.4rem",
                borderRadius: "4px",
              }}
            >
              {w.multi}
            </span>
            <span style={{ color: "var(--color-border)", fontSize: "0.6rem" }}>•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function GameCard({ game }: { game: (typeof GAMES)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        background: "var(--color-card)",
        border: `1px solid ${hovered ? game.color + "60" : "var(--color-border)"}`,
        borderRadius: "1rem",
        padding: "1.75rem",
        cursor: "pointer",
        transition: "border-color 0.25s",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          right: "-20%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${game.color}18 0%, transparent 70%)`,
          pointerEvents: "none",
          transition: "opacity 0.3s",
          opacity: hovered ? 1 : 0.4,
        }}
      />

      {/* Icon + tag row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <motion.span
          animate={{ scale: hovered ? 1.15 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          style={{ fontSize: "2.25rem", display: "block" }}
        >
          {game.icon}
        </motion.span>
        <span
          className="font-mono text-xs font-semibold tracking-widest"
          style={{
            background: `${game.tagColor}20`,
            color: game.tagColor,
            border: `1px solid ${game.tagColor}40`,
            padding: "0.2rem 0.6rem",
            borderRadius: "9999px",
          }}
        >
          {game.tag}
        </span>
      </div>

      {/* Name + desc */}
      <h3
        className="font-display font-bold text-xl"
        style={{ color: "var(--color-ghost)", marginBottom: "0.4rem" }}
      >
        {game.name}
      </h3>
      <p
        className="font-body text-sm"
        style={{ color: "var(--color-muted)", marginBottom: "1.5rem", lineHeight: 1.5 }}
      >
        {game.desc}
      </p>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <p className="font-mono text-xs" style={{ color: "var(--color-dim)" }}>
            Players
          </p>
          <p className="font-mono text-sm font-semibold" style={{ color: "var(--color-ghost)" }}>
            {game.players.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="font-mono text-xs" style={{ color: "var(--color-dim)" }}>
            Max Win
          </p>
          <p className="font-mono text-sm font-semibold" style={{ color: game.color }}>
            {game.maxWin}
          </p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={game.href}
        style={{
          display: "block",
          textAlign: "center",
          padding: "0.75rem",
          borderRadius: "0.5rem",
          background: hovered ? game.color : "var(--color-surface)",
          color: hovered ? "#fff" : "var(--color-ghost)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.875rem",
          fontWeight: 600,
          textDecoration: "none",
          border: `1px solid ${hovered ? game.color : "var(--color-border)"}`,
          transition: "all 0.25s",
        }}
      >
        Play Now →
      </Link>
    </motion.div>
  );
}

export default function GamingPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "var(--color-void)",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "var(--color-green)",
              boxShadow: "0 0 8px var(--color-green)",
              display: "inline-block",
              animation: "pulse-ring 1.4s ease-out infinite",
            }}
          />
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-green)" }}>
            Live Gaming
          </span>
        </div>
        <h1
          className="font-display font-bold"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "var(--color-ghost)" }}
        >
          Choose Your Game
        </h1>
        <p className="font-body text-sm" style={{ color: "var(--color-muted)", marginTop: "0.4rem" }}>
          Provably fair · Instant payouts · Real USDT prizes
        </p>
      </div>

      {/* Hero image banner */}
      <HeroBanner />

      {/* Live wins ticker */}
      <LiveFeed />

      {/* Game grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {GAMES.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>

      {/* Bottom stats */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "3rem",
          padding: "1.5rem",
          background: "var(--color-surface)",
          borderRadius: "1rem",
          border: "1px solid var(--color-border)",
        }}
      >
        {[
          { v: "$2.4M+", l: "Total paid out" },
          { v: "4,964",  l: "Active players" },
          { v: "99.97%", l: "Uptime" },
          { v: "0.1s",   l: "Avg payout speed" },
        ].map((s) => (
          <div key={s.l} style={{ textAlign: "center" }}>
            <p
              className="font-display font-bold text-2xl"
              style={{ color: "var(--color-ghost)" }}
            >
              {s.v}
            </p>
            <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
              {s.l}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
