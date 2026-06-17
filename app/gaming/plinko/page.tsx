"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import confetti from "canvas-confetti";

// ── Plinko constants ──────────────────────────────────────
const ROWS = 12;
const GRAVITY = 0.25;
const BOUNCE = 0.55;
const PEG_R = 5;
const BALL_R = 8;
const W = 500;
const H = 520;

// Prize multipliers per bucket (16 buckets, symmetric)
const RISK = {
  low:    [0.5, 1, 1, 1.2, 1.5, 2, 3, 5, 3, 2, 1.5, 1.2, 1, 1, 1, 0.5],
  medium: [0.2, 0.5, 1, 1.5, 2, 4, 8, 16, 8, 4, 2, 1.5, 1, 0.5, 0.2, 0.1],
  high:   [0.1, 0.2, 0.3, 0.5, 1, 3, 9, 500, 9, 3, 1, 0.5, 0.3, 0.2, 0.1, 0.1],
};

type Risk = "low" | "medium" | "high";

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
  trail: { x: number; y: number }[];
  color: string;
}

interface Peg {
  x: number;
  y: number;
}

function buildPegs(): Peg[] {
  const pegs: Peg[] = [];
  const startY = 60;
  const rowH = (H - startY - 60) / ROWS;
  for (let r = 0; r < ROWS; r++) {
    const count = r + 3;
    const totalW = (count - 1) * 36;
    const startX = W / 2 - totalW / 2;
    for (let c = 0; c < count; c++) {
      pegs.push({ x: startX + c * 36, y: startY + r * rowH });
    }
  }
  return pegs;
}

const PEGS = buildPegs();
const BUCKET_COUNT = 16;
const BUCKET_W = W / BUCKET_COUNT;
const BALL_COLORS = ["#5B4FE8", "#F5C542", "#22C55E", "#EC4899", "#F59E0B", "#10B981"];

export default function PlinkoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>([]);
  const rafRef = useRef<number>(0);
  const ballIdRef = useRef(0);
  const [bet, setBet] = useState("10");
  const [risk, setRisk] = useState<Risk>("medium");
  const [results, setResults] = useState<{ multi: number; profit: number; color: string }[]>([]);
  const [balance, setBalance] = useState(1000);
  const [dropping, setDropping] = useState(false);

  const mults = RISK[risk];
  const bucketColors = mults.map((m) =>
    m >= 10 ? "#F5C542" : m >= 3 ? "#5B4FE8" : m >= 1 ? "#22C55E" : "#6B7280"
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "#0D1120";
    ctx.fillRect(0, 0, W, H);

    // Pegs
    PEGS.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, PEG_R, 0, Math.PI * 2);
      ctx.fillStyle = "#252C4A";
      ctx.fill();
      ctx.strokeStyle = "#374151";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Buckets
    mults.forEach((m, i) => {
      const x = i * BUCKET_W;
      const y = H - 48;
      ctx.fillStyle = bucketColors[i] + "22";
      ctx.fillRect(x + 1, y, BUCKET_W - 2, 48);
      ctx.strokeStyle = bucketColors[i] + "55";
      ctx.strokeRect(x + 1, y, BUCKET_W - 2, 48);
      ctx.fillStyle = bucketColors[i];
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(m >= 100 ? `${m}x` : `${m}x`, x + BUCKET_W / 2, H - 28);
    });

    // Balls + trails
    ballsRef.current.forEach((ball) => {
      // Trail
      ball.trail.forEach((t, ti) => {
        const alpha = ti / ball.trail.length;
        ctx.beginPath();
        ctx.arc(t.x, t.y, BALL_R * (0.3 + alpha * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = ball.color + Math.floor(alpha * 80).toString(16).padStart(2, "0");
        ctx.fill();
      });

      // Ball
      if (ball.active) {
        const grd = ctx.createRadialGradient(ball.x - 2, ball.y - 2, 1, ball.x, ball.y, BALL_R);
        grd.addColorStop(0, "#fff");
        grd.addColorStop(0.4, ball.color);
        grd.addColorStop(1, ball.color + "88");
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.shadowColor = ball.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
  }, [mults, bucketColors]);

  const tick = useCallback(() => {
    ballsRef.current = ballsRef.current.map((ball) => {
      if (!ball.active) return ball;

      let { x, y, vx, vy } = ball;
      vy += GRAVITY;
      x += vx;
      y += vy;

      // Trail
      const trail = [...ball.trail, { x, y }].slice(-12);

      // Peg collisions
      for (const peg of PEGS) {
        const dx = x - peg.x;
        const dy = y - peg.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PEG_R + BALL_R) {
          const nx = dx / dist;
          const ny = dy / dist;
          const dot = vx * nx + vy * ny;
          vx = (vx - 2 * dot * nx) * BOUNCE;
          vy = (vy - 2 * dot * ny) * BOUNCE;
          // Push out
          const overlap = PEG_R + BALL_R - dist + 1;
          x += nx * overlap;
          y += ny * overlap;
          // Add slight random drift to simulate real Plinko
          vx += (Math.random() - 0.5) * 0.8;
        }
      }

      // Wall bounce
      if (x < BALL_R) { x = BALL_R; vx = Math.abs(vx) * BOUNCE; }
      if (x > W - BALL_R) { x = W - BALL_R; vx = -Math.abs(vx) * BOUNCE; }

      // Hit bottom
      if (y > H - 48) {
        const bucket = Math.min(BUCKET_COUNT - 1, Math.floor(x / BUCKET_W));
        const multi = mults[bucket];
        const betVal = parseFloat(bet) || 10;
        const profit = parseFloat((betVal * multi - betVal).toFixed(2));
        const color = bucketColors[bucket];

        setBalance((b) => parseFloat((b + betVal * multi).toFixed(2)));
        setResults((r) => [{ multi, profit, color }, ...r].slice(0, 8));
        setDropping(false);

        if (multi >= 10) {
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ["#F5C542", "#5B4FE8", "#22C55E"] });
        }

        return { ...ball, active: false, trail };
      }

      return { ...ball, x, y, vx, vy, trail };
    });

    draw();
    rafRef.current = requestAnimationFrame(tick);
  }, [bet, mults, bucketColors, draw]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const dropBall = () => {
    const betVal = parseFloat(bet);
    if (!betVal || betVal > balance || dropping) return;
    setBalance((b) => parseFloat((b - betVal).toFixed(2)));
    setDropping(true);

    ballsRef.current = [
      ...ballsRef.current.filter((b) => b.active),
      {
        id: ballIdRef.current++,
        x: W / 2 + (Math.random() - 0.5) * 10,
        y: 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 2,
        active: true,
        trail: [],
        color: BALL_COLORS[ballIdRef.current % BALL_COLORS.length],
      },
    ];
  };

  return (
    <main style={{ minHeight: "100dvh", background: "var(--color-void)", padding: "1.5rem" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <Link href="/gaming" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textDecoration: "none" }}>
            ← Games
          </Link>
          <span style={{ color: "var(--color-border)" }}>|</span>
          <span className="font-display font-bold text-xl" style={{ color: "var(--color-ghost)" }}>🎯 Plinko</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "1.25rem" }}>

          {/* Canvas */}
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              style={{ width: "100%", display: "block" }}
            />
          </div>

          {/* Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Balance */}
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                padding: "1rem",
                textAlign: "center",
              }}
            >
              <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>Balance</p>
              <p className="font-display font-bold text-2xl" style={{ color: "var(--color-ghost)" }}>
                ${balance.toLocaleString()}
              </p>
            </div>

            {/* Bet */}
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                padding: "1rem",
              }}
            >
              <label className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted)", display: "block", marginBottom: "0.5rem" }}>
                Bet Amount
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
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}>
                {[10, 25, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setBet(String(v))}
                    style={{
                      flex: 1,
                      padding: "0.4rem 0",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.375rem",
                      color: "var(--color-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                    }}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk */}
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                padding: "1rem",
              }}
            >
              <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted)", marginBottom: "0.5rem" }}>
                Risk
              </p>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {(["low", "medium", "high"] as Risk[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRisk(r)}
                    style={{
                      flex: 1,
                      padding: "0.5rem",
                      borderRadius: "0.375rem",
                      background: risk === r ? "var(--color-indigo)" : "var(--color-surface)",
                      border: `1px solid ${risk === r ? "var(--color-indigo)" : "var(--color-border)"}`,
                      color: risk === r ? "#fff" : "var(--color-muted)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Drop */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={dropBall}
              disabled={dropping || parseFloat(bet) > balance}
              style={{
                padding: "1rem",
                background: dropping ? "var(--color-dim)" : "var(--color-indigo)",
                border: "none",
                borderRadius: "0.75rem",
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: dropping ? "not-allowed" : "pointer",
                boxShadow: dropping ? "none" : "0 0 20px rgba(91,79,232,0.3)",
              }}
            >
              {dropping ? "Dropping…" : "Drop Ball 🎯"}
            </motion.button>

            {/* Recent results */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>Recent</p>
              <AnimatePresence>
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.4rem 0.75rem",
                      borderRadius: "0.375rem",
                      background: `${r.color}15`,
                      border: `1px solid ${r.color}30`,
                    }}
                  >
                    <span className="font-mono text-xs" style={{ color: r.color }}>{r.multi}x</span>
                    <span className="font-mono text-xs" style={{ color: r.profit >= 0 ? "#22C55E" : "#EF4444" }}>
                      {r.profit >= 0 ? "+" : ""}${r.profit}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          main > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
