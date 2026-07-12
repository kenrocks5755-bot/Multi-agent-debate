import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/theme-context";

interface Orb {
  size: number; x: string; y: string;
  color1: string; color2: string;
  duration: number; delay: number;
  driftX: number[]; driftY: number[];
}

const orbs: Orb[] = [
  { size: 520, x: "12%", y: "18%", color1: "#7C5CFF", color2: "#5B8CFF", duration: 28, delay: 0, driftX: [0, 40, -25, 15, 0], driftY: [0, -25, 35, -15, 0] },
  { size: 420, x: "78%", y: "25%", color1: "#5B8CFF", color2: "#57D38C", duration: 32, delay: 3, driftX: [0, -30, 20, -10, 0], driftY: [0, 20, -30, 15, 0] },
  { size: 360, x: "55%", y: "72%", color1: "#57D38C", color2: "#F6C453", duration: 30, delay: 1.5, driftX: [0, 25, -35, 20, 0], driftY: [0, -15, 25, -20, 0] },
  { size: 300, x: "85%", y: "70%", color1: "#7C5CFF", color2: "#F6C453", duration: 36, delay: 4, driftX: [0, -20, 15, -25, 0], driftY: [0, 30, -20, 10, 0] },
  { size: 280, x: "30%", y: "80%", color1: "#F6C453", color2: "#57D38C", duration: 34, delay: 2, driftX: [0, 15, -20, 10, 0], driftY: [0, -10, 15, -5, 0] },
];

export default function AnimatedBackground() {
  const { isDark } = useTheme();
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  const handleMouse = useCallback((e: MouseEvent) => {
    setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [handleMouse]);

  const dots = useMemo(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      delay: Math.random() * 6,
      duration: 10 + Math.random() * 12,
      driftX: [-8 + Math.random() * 16, -8 + Math.random() * 16],
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {isDark && (
        <div className="absolute inset-0 z-1"
          style={{
            background: "linear-gradient(135deg, rgba(9,9,20,0.85), rgba(15,18,36,0.75), rgba(17,26,46,0.70), rgba(18,38,61,0.65))",
          }}
        />
      )}
      <div className="absolute inset-0 grid-bg"
        style={{ opacity: isDark ? 0.20 : 0.35 }}
      />

      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            width: orb.size, height: orb.size,
            left: orb.x, top: orb.y,
            marginLeft: -orb.size / 2, marginTop: -orb.size / 2,
            background: `radial-gradient(circle at 40% 40%, ${orb.color1}12, ${orb.color2}0c, transparent 55%)`,
            transform: `translate(${(mouse.x - 0.5) * (6 + i * 2)}px, ${(mouse.y - 0.5) * (6 + i * 2)}px)`,
          }}
          animate={{
            x: orb.driftX, y: orb.driftY, scale: [1, 1.04, 0.97, 1.02, 1],
          }}
          transition={{
            x: { duration: orb.duration, repeat: Infinity, delay: orb.delay, ease: "easeInOut" },
            y: { duration: orb.duration, repeat: Infinity, delay: orb.delay, ease: "easeInOut" },
            scale: { duration: orb.duration * 0.7, repeat: Infinity, delay: orb.delay, ease: "easeInOut" },
          }}
        />
      ))}

      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: dot.size, height: dot.size,
            left: `${dot.x}%`, top: `${dot.y}%`,
            backgroundColor: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.018)",
          }}
          animate={{
            y: [-8, 8, -8], x: dot.driftX,
            opacity: [0, 0.4, 0],
          }}
          transition={{
            y: { duration: dot.duration, repeat: Infinity, delay: dot.delay, ease: "easeInOut" },
            x: { duration: dot.duration * 1.2, repeat: Infinity, delay: dot.delay, ease: "easeInOut" },
            opacity: { duration: dot.duration, repeat: Infinity, delay: dot.delay, ease: "easeInOut" },
          }}
        />
      ))}
    </div>
  );
}
