"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  delay: number;
  shape: "circle" | "rect" | "diamond";
}

const COLORS = [
  "#F5C542", // gold
  "#5B4FE8", // indigo
  "#22C55E", // green
  "#7B70FF", // indigo bright
  "#F59E0B", // amber
  "#ffffff",
];

export default function ConfettiExplosion() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: -(Math.random() * 160 + 40),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 7 + 4,
        angle: Math.random() * 360,
        distance: Math.random() * 80 + 40,
        delay: Math.random() * 0.2,
        shape: (["circle", "rect", "diamond"] as const)[Math.floor(Math.random() * 3)],
      }))
    );
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            width: p.shape === "rect" ? p.size * 0.5 : p.size,
            height: p.shape === "rect" ? p.size * 2 : p.size,
            background: p.color,
            borderRadius:
              p.shape === "circle"
                ? "50%"
                : p.shape === "diamond"
                ? "2px"
                : "1px",
            transform: `rotate(${p.angle}deg)`,
            left: 0,
            top: 0,
            opacity: 0,
            animation: `confetti-burst-${p.id % 4} 1.8s ease-out forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Inject keyframes dynamically */}
      <style>{`
        @keyframes confetti-burst-0 {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(${pieces[0]?.x ?? 40}px, ${pieces[0]?.y ?? -100}px) rotate(540deg) scale(0); opacity: 0; }
        }
        @keyframes confetti-burst-1 {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(${pieces[1]?.x ?? -60}px, ${pieces[1]?.y ?? -80}px) rotate(-360deg) scale(0); opacity: 0; }
        }
        @keyframes confetti-burst-2 {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(${pieces[2]?.x ?? 70}px, ${pieces[2]?.y ?? -120}px) rotate(720deg) scale(0); opacity: 0; }
        }
        @keyframes confetti-burst-3 {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(${pieces[3]?.x ?? -30}px, ${pieces[3]?.y ?? -90}px) rotate(-540deg) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
