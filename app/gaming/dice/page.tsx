"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import confetti from "canvas-confetti";

interface Roll {
  result: number;
  target: number;
  mode: "over" | "under";
  win: boolean;
  profit: number;
}

function DiceFace({ value }: { value: number }) {
  // Dot positions for d6 faces
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
  };

  const d = Math.max(1, Math.min(6, Math.round(value / 100 * 6))) || 1;

  return (
    <svg viewBox="0 0 100 100" width="80" height="80">
      <rect x="5" y="5" width="90" height="90" rx="16" fill="var(--color-card)" stroke="var(--color-border)" strokeWidth="2" />
      {(dots[d] || []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="var(--color-ghost)" />
      ))}
    </svg>
  );
}

export default function DiceGame() {
  const [target, setTarget] = useState(50);
  const [mode, setMode] = useState<"over" | "under">("over");
  const [bet, setBet] = useState("10");
  const [balance, setBalance] = useState(1000);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [streak, setStreak] = useState(0);
  const [displayNum, setDisplayNum] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const winChance = mode === "over" ? (100 - target) / 100 : target / 100;
  const multiplier = winChance > 0 ? parseFloat((0.99 / winChance).toFixed(4)) : 0;
  const payout = parseFloat((parseFloat(bet) * multiplier).toFixed(2));

  const roll = () => {
    const betVal = parseFloat(bet);
    if (!betVal || betVal > balance || rolling) return;
    setRolling(true);
    setBalance((b) => parseFloat((b - betVal).toFixed(2)));

    let count = 0;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayNum(Math.floor(Math.random() * 100) + 1);
      count++;
      if (count >= 18) {
        clearInterval(intervalRef.current);
        const r = Math.floor(Math.random() * 100) + 1;
        const win =
          mode === "over" ? r > target : r < target;

        setResult(r);
        setDisplayNum(r);
        setLastWin(win);
        setRolling(false);

        const profit = win
          ? parseFloat((betVal * multiplier - betVal).toFixed(2))
          : parseFloat((-betVal).toFixed(2));

        setBalance((b) => parseFloat((b + (win ? betVal * multiplier : 0)).toFixed(2)));
        setRolls((prev) => [{ result: r, target, mode, win, profit }, ...prev].slice(0, 10));
        setStreak((s) => (win ? s + 1 : 0));

        if (win && multiplier >= 5) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
        }
      }
    }, 60);
  };

  return (
    <main style={{ minHeight: "100dvh", background: "var(--color-void)", padding: "1.5rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <Link href="/gaming" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textDecoration: "none" }}>
            ← Games
          </Link>
          <span style={{ color: "var(--color-border)" }}>|</span>
          <span className="font-display font-bold text-xl" style={{ color: "var(--color-ghost)" }}>🎲 Dice</span>
          {streak >= 3 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="font-mono text-xs"
              style={{
                background: "rgba(245,197,66,0.15)",
                border: "1px solid rgba(245,197,66,0.3)",
                color: "#F5C542",
                padding: "0.2rem 0.6rem",
                borderRadius: "9999px",
              }}
            >
              🔥 {streak} streak
            </motion.span>
          )}
        </div>

        {/* Result display */}
        <div
          style={{
            background: "var(--color-card)",
            border: `1px solid ${lastWin === true ? "rgba(34,197,94,0.4)" : lastWin === false ? "rgba(239,68,68,0.4)" : "var(--color-border)"}`,
            borderRadius: "1.25rem",
            padding: "2.5rem",
            textAlign: "center",
            marginBottom: "1.25rem",
            transition: "border-color 0.3s",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          {lastWin !== null && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: lastWin
                  ? "radial-gradient(circle at center, rgba(34,197,94,0.06) 0%, transparent 70%)"
                  : "radial-gradient(circle at center, rgba(239,68,68,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Dice visual */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", marginBottom: "1.5rem" }}>
            <motion.div
              animate={rolling ? { rotate: [0, 180, 360, 540], scale: [1, 0.8, 1.2, 1] } : {}}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              <DiceFace value={displayNum ?? 50} />
            </motion.div>

            <div>
              <motion.p
                key={displayNum}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-display font-bold"
                style={{
                  fontSize: "4rem",
                  color: lastWin === true ? "#22C55E" : lastWin === false ? "#EF4444" : "var(--color-ghost)",
                  lineHeight: 1,
                  transition: "color 0.3s",
                }}
              >
                {displayNum ?? "—"}
              </motion.p>
              <AnimatePresence mode="wait">
                {lastWin !== null && !rolling && (
                  <motion.p
                    key={String(lastWin)}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-display font-bold text-xl"
                    style={{ color: lastWin ? "#22C55E" : "#EF4444" }}
                  >
                    {lastWin ? "WIN!" : "LOSS"}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Target line */}
          <div
            style={{
              width: "100%",
              height: "8px",
              background: "var(--color-surface)",
              borderRadius: "9999px",
              position: "relative",
              overflow: "visible",
              marginBottom: "0.75rem",
            }}
          >
            {/* Win zone */}
            <div
              style={{
                position: "absolute",
                left: mode === "under" ? 0 : `${target}%`,
                right: mode === "over" ? 0 : `${100 - target}%`,
                top: 0,
                bottom: 0,
                background: "var(--color-indigo)",
                borderRadius: "9999px",
                opacity: 0.6,
              }}
            />
            {/* Target marker */}
            <div
              style={{
                position: "absolute",
                left: `${target}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "var(--color-ghost)",
                border: "2px solid var(--color-indigo)",
                boxShadow: "0 0 10px var(--color-indigo)",
              }}
            />
            {/* Result marker */}
            {result !== null && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: "absolute",
                  left: `${result}%`,
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  background: lastWin ? "#22C55E" : "#EF4444",
                  border: `2px solid ${lastWin ? "#22C55E" : "#EF4444"}`,
                  boxShadow: `0 0 8px ${lastWin ? "#22C55E" : "#EF4444"}`,
                }}
              />
            )}
          </div>
          <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
            Roll {mode === "over" ? "above" : "below"} {target} to win
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          {/* Left: target + mode */}
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              padding: "1.25rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {(["over", "under"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    background: mode === m ? "var(--color-indigo)" : "var(--color-surface)",
                    border: `1px solid ${mode === m ? "var(--color-indigo)" : "var(--color-border)"}`,
                    color: mode === m ? "#fff" : "var(--color-muted)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  Roll {m}
                </button>
              ))}
            </div>

            <label className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted)", display: "block", marginBottom: "0.5rem" }}>
              Target: {target}
            </label>
            <input
              type="range"
              min="5"
              max="95"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--color-indigo)", cursor: "pointer" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "1rem" }}>
              {[
                { l: "Win chance", v: `${(winChance * 100).toFixed(1)}%` },
                { l: "Multiplier", v: `${multiplier}x` },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>{s.l}</p>
                  <p className="font-mono text-sm font-semibold" style={{ color: "var(--color-ghost)" }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: bet + roll */}
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <div>
              <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>Balance</p>
              <p className="font-display font-bold text-xl" style={{ color: "var(--color-ghost)" }}>${balance.toLocaleString()}</p>
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted)", display: "block", marginBottom: "0.4rem" }}>
                Bet
              </label>
              <input
                value={bet}
                onChange={(e) => setBet(e.target.value)}
                type="number"
                min="1"
                style={{
                  width: "100%",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                  padding: "0.625rem 0.75rem",
                  color: "var(--color-ghost)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <p className="font-mono text-xs" style={{ color: "var(--color-muted)", marginTop: "0.3rem" }}>
                Payout: <span style={{ color: "#22C55E" }}>${payout}</span>
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={roll}
              disabled={rolling || parseFloat(bet) > balance}
              style={{
                padding: "0.875rem",
                background: rolling ? "var(--color-dim)" : "var(--color-indigo)",
                border: "none",
                borderRadius: "0.5rem",
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: rolling ? "not-allowed" : "pointer",
                marginTop: "auto",
              }}
            >
              {rolling ? "Rolling…" : "Roll Dice 🎲"}
            </motion.button>
          </div>
        </div>

        {/* Roll history */}
        {rolls.length > 0 && (
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
            }}
          >
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted)", marginBottom: "0.75rem" }}>
              Recent Rolls
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {rolls.map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
                    Roll {r.mode} {r.target}
                  </span>
                  <span className="font-mono text-sm font-semibold" style={{ color: r.win ? "#22C55E" : "#EF4444" }}>
                    {r.result} — {r.win ? `+$${r.profit}` : `$${r.profit}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 640px) {
          main > div > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
