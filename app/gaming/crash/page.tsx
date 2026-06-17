"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import confetti from "canvas-confetti";

// ── Types ─────────────────────────────────────────────────
type Phase = "waiting" | "flying" | "crashed";

interface Bet {
  id: number;
  user: string;
  amount: number;
  cashout: number | null;
  profit: number | null;
}

// ── Mock live bets ────────────────────────────────────────
const MOCK_USERS = ["0xNirvana", "veloscout", "degenqueen", "blocksmith", "alphaWolf", "pumpmaster", "satoshi99", "moonboi"];

function makeBets(): Bet[] {
  return MOCK_USERS.slice(0, 6).map((u, i) => ({
    id: i,
    user: u,
    amount: [5, 10, 25, 50, 100, 200][i],
    cashout: null,
    profit: null,
  }));
}

// ── Crash multiplier math (exponential curve) ─────────────
function getMultiplier(elapsed: number): number {
  return parseFloat(Math.pow(Math.E, 0.00006 * elapsed).toFixed(2));
}

// ── Rocket SVG ────────────────────────────────────────────
function Rocket({ crashed }: { crashed: boolean }) {
  return (
    <motion.div
      animate={crashed ? { rotate: 90, scale: 0.5, opacity: 0 } : { rotate: -45, scale: 1, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ fontSize: "3rem", display: "inline-block", filter: crashed ? "grayscale(1)" : "none" }}
    >
      🚀
    </motion.div>
  );
}

// ── Canvas graph ──────────────────────────────────────────
function CrashGraph({
  phase,
  multiplier,
  crashPoint,
}: {
  phase: Phase;
  multiplier: number;
  crashPoint: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    if (phase === "waiting") {
      historyRef.current = [];
    }
    if (phase === "flying") {
      historyRef.current.push(multiplier);
    }
    if (phase === "crashed") {
      historyRef.current.push(crashPoint);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const history = historyRef.current;
    if (history.length < 2) return;

    const maxM = Math.max(...history, 2);
    const toX = (i: number) => (i / (history.length - 1)) * (W - 40) + 20;
    const toY = (m: number) => H - 20 - ((m - 1) / (maxM - 1)) * (H - 40);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let m = 1; m <= maxM; m += 0.5) {
      const y = toY(m);
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(W - 20, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "10px monospace";
      ctx.fillText(`${m.toFixed(1)}x`, 2, y + 4);
    }

    // Curve
    const color = phase === "crashed" ? "#EF4444" : "#5B4FE8";
    const gradient = ctx.createLinearGradient(0, 0, W, 0);
    gradient.addColorStop(0, color + "40");
    gradient.addColorStop(1, color);

    ctx.beginPath();
    ctx.moveTo(toX(0), toY(history[0]));
    history.forEach((m, i) => ctx.lineTo(toX(i), toY(m)));
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(toX(history.length - 1), H - 20);
    ctx.lineTo(toX(0), H - 20);
    ctx.closePath();
    ctx.fillStyle = color + "12";
    ctx.fill();

    // Current dot
    if (history.length > 0) {
      const last = history[history.length - 1];
      const lx = toX(history.length - 1);
      const ly = toY(last);
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }, [multiplier, phase, crashPoint]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={260}
      style={{ width: "100%", height: "260px", display: "block" }}
    />
  );
}

export default function CrashGame() {
  const [phase, setPhase] = useState<Phase>("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [bet, setBet] = useState("10");
  const [betPlaced, setBetPlaced] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(0);
  const [bets, setBets] = useState<Bet[]>(makeBets());
  const [history, setHistory] = useState<number[]>([14.2, 1.03, 3.7, 8.8, 1.24, 2.06, 55.1, 1.7]);
  const [message, setMessage] = useState<string | null>(null);

  const startRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const crashPointRef = useRef<number>(0);

  // Generate random crash point (house edge baked in)
  const genCrash = () => {
    const r = Math.random();
    if (r < 0.01) return 1.0; // instant crash 1%
    return parseFloat(Math.max(1.01, 0.99 / (1 - r)).toFixed(2));
  };

  const doConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#5B4FE8", "#F5C542", "#22C55E", "#7B70FF"],
    });
  };

  const startCountdown = useCallback(() => {
    setPhase("waiting");
    setMultiplier(1.0);
    setBetPlaced(false);
    setCashedOut(false);
    setCashoutMultiplier(0);
    setMessage(null);
    setBets(makeBets());
    setCountdown(5);

    const cp = genCrash();
    crashPointRef.current = cp;
    setCrashPoint(cp);

    let c = 5;
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(t);
        launch();
      }
    }, 1000);
  }, []);

  const launch = useCallback(() => {
    setPhase("flying");
    startRef.current = performance.now();

    // Auto-cashout some mock bets
    const autoCashouts = [1.5, 2.0, 3.0, 1.8, 5.0, 10.0];

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const m = getMultiplier(elapsed);
      setMultiplier(m);

      // Simulate mock user cashouts
      setBets((prev) =>
        prev.map((b, i) => {
          if (b.cashout !== null) return b;
          if (m >= autoCashouts[i] && Math.random() > 0.5) {
            return {
              ...b,
              cashout: m,
              profit: parseFloat((b.amount * m - b.amount).toFixed(2)),
            };
          }
          return b;
        })
      );

      if (m >= crashPointRef.current) {
        cancelAnimationFrame(rafRef.current);
        setPhase("crashed");
        setMultiplier(crashPointRef.current);
        setHistory((h) => [crashPointRef.current, ...h].slice(0, 12));

        if (betPlaced && !cashedOut) {
          setMessage(`BUSTED — Lost $${bet}`);
        }

        setTimeout(startCountdown, 4000);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [betPlaced, cashedOut, bet, startCountdown]);

  useEffect(() => {
    startCountdown();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const placeBet = () => {
    if (phase !== "waiting" || betPlaced) return;
    setBetPlaced(true);
  };

  const cashOut = () => {
    if (phase !== "flying" || !betPlaced || cashedOut) return;
    setCashedOut(true);
    setCashoutMultiplier(multiplier);
    const profit = parseFloat(bet) * multiplier;
    setMessage(`Cashed out at ${multiplier.toFixed(2)}x — +$${profit.toFixed(2)}`);
    doConfetti();
  };

  const multiplierColor =
    phase === "crashed"
      ? "#EF4444"
      : multiplier < 2
      ? "#E8E8E8"
      : multiplier < 5
      ? "#22C55E"
      : "#F5C542";

  return (
    <main style={{ minHeight: "100dvh", background: "var(--color-void)", padding: "1.5rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <Link href="/gaming" style={{ color: "var(--color-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem", textDecoration: "none" }}>
            ← Games
          </Link>
          <span style={{ color: "var(--color-border)" }}>|</span>
          <span className="font-display font-bold text-xl" style={{ color: "var(--color-ghost)" }}>🚀 Crash</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.25rem" }}>

          {/* Left: graph + controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Graph card */}
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Multiplier overlay */}
              <div style={{ position: "absolute", top: "1rem", left: 0, right: 0, textAlign: "center", zIndex: 2, pointerEvents: "none" }}>
                {phase === "waiting" ? (
                  <div>
                    <p className="font-mono text-sm" style={{ color: "var(--color-muted)" }}>Next round in</p>
                    <motion.p
                      key={countdown}
                      initial={{ scale: 1.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="font-display font-bold"
                      style={{ fontSize: "3.5rem", color: "var(--color-ghost)" }}
                    >
                      {countdown}
                    </motion.p>
                  </div>
                ) : (
                  <div>
                    <motion.p
                      animate={{ scale: phase === "crashed" ? [1, 1.2, 1] : 1 }}
                      className="font-display font-bold"
                      style={{
                        fontSize: "clamp(2.5rem, 6vw, 4rem)",
                        color: multiplierColor,
                        textShadow: phase === "crashed" ? "0 0 30px #EF4444" : "none",
                        transition: "color 0.3s",
                      }}
                    >
                      {phase === "crashed" ? `CRASHED @ ${crashPoint.toFixed(2)}x` : `${multiplier.toFixed(2)}x`}
                    </motion.p>
                    {phase === "flying" && <Rocket crashed={false} />}
                    {phase === "crashed" && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: "2rem" }}>
                        💥
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <CrashGraph phase={phase} multiplier={multiplier} crashPoint={crashPoint} />
            </div>

            {/* Bet controls */}
            <div
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "1rem",
                padding: "1.25rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "120px" }}>
                <label className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted)", display: "block", marginBottom: "0.4rem" }}>
                  Bet (USDT)
                </label>
                <div style={{ display: "flex", gap: "0.4rem" }}>
                  <input
                    value={bet}
                    onChange={(e) => setBet(e.target.value)}
                    disabled={betPlaced}
                    type="number"
                    min="1"
                    style={{
                      flex: 1,
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.5rem",
                      padding: "0.625rem 0.75rem",
                      color: "var(--color-ghost)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.875rem",
                      outline: "none",
                    }}
                  />
                  {["½", "2x"].map((label) => (
                    <button
                      key={label}
                      onClick={() =>
                        setBet((v) =>
                          label === "½"
                            ? String(Math.max(1, Math.floor(parseFloat(v) / 2)))
                            : String(parseFloat(v) * 2)
                        )
                      }
                      disabled={betPlaced}
                      style={{
                        padding: "0 0.75rem",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.5rem",
                        color: "var(--color-muted)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {phase === "flying" && betPlaced && !cashedOut ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={cashOut}
                  style={{
                    padding: "0.75rem 2rem",
                    background: "#22C55E",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: "0 0 20px rgba(34,197,94,0.4)",
                    animation: "pulse-ring 0.8s ease-out infinite",
                  }}
                >
                  Cash Out ${(parseFloat(bet) * multiplier).toFixed(2)}
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={placeBet}
                  disabled={betPlaced || phase === "flying" || phase === "crashed"}
                  style={{
                    padding: "0.75rem 2rem",
                    background: betPlaced ? "var(--color-dim)" : "var(--color-indigo)",
                    border: "none",
                    borderRadius: "0.5rem",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    cursor: betPlaced ? "not-allowed" : "pointer",
                  }}
                >
                  {betPlaced ? "Bet Placed ✓" : "Place Bet"}
                </motion.button>
              )}
            </div>

            {/* Message */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "0.75rem",
                    background: message.includes("Busted") || message.includes("Lost")
                      ? "rgba(239,68,68,0.1)"
                      : "rgba(34,197,94,0.1)",
                    border: `1px solid ${message.includes("Busted") || message.includes("Lost") ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
                    color: message.includes("Busted") || message.includes("Lost") ? "#EF4444" : "#22C55E",
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* History */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              <span className="font-mono text-xs" style={{ color: "var(--color-muted)", alignSelf: "center" }}>History:</span>
              {history.map((h, i) => (
                <span
                  key={i}
                  className="font-mono text-xs"
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    background: h < 2 ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.1)",
                    color: h < 2 ? "#EF4444" : "#22C55E",
                    border: `1px solid ${h < 2 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                  }}
                >
                  {h.toFixed(2)}x
                </span>
              ))}
            </div>
          </div>

          {/* Right: live bets */}
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              height: "fit-content",
            }}
          >
            <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
              Live Bets ({bets.length})
            </p>
            {bets.map((b) => (
              <motion.div
                key={b.id}
                animate={b.cashout !== null ? { backgroundColor: "rgba(34,197,94,0.08)" } : {}}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0.625rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                }}
              >
                <div>
                  <p className="font-mono text-xs" style={{ color: "var(--color-ghost)" }}>
                    {b.user}
                  </p>
                  <p className="font-mono text-xs" style={{ color: "var(--color-muted)" }}>
                    ${b.amount}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {b.cashout !== null ? (
                    <>
                      <p className="font-mono text-xs font-semibold" style={{ color: "#22C55E" }}>
                        {b.cashout.toFixed(2)}x
                      </p>
                      <p className="font-mono text-xs" style={{ color: "#22C55E" }}>
                        +${b.profit}
                      </p>
                    </>
                  ) : (
                    <p className="font-mono text-xs" style={{ color: "var(--color-dim)" }}>
                      {phase === "flying" ? `${multiplier.toFixed(2)}x` : "—"}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          main > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
