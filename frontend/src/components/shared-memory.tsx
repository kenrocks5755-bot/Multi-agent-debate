import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface SharedMemoryProps {
  isPulsing: boolean;
  compact?: boolean;
}

function Ring({ size, color, speed, delay, direction = 1 }: { size: number; color: string; speed: number; delay: number; direction?: number }) {
  return (
    <motion.div className="absolute rounded-full border"
      style={{ width: size, height: size, borderColor: color, borderWidth: 1, left: "50%", top: "50%", marginLeft: -size / 2, marginTop: -size / 2 }}
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: [0.2, 0.5, 0.2], rotate: 360 * direction }}
      transition={{ opacity: { duration: 3, repeat: Infinity, ease: "easeInOut", delay }, rotate: { duration: speed, repeat: Infinity, ease: "linear" } }} />
  );
}

function Particle({ radius, color, delay }: { radius: number; color: string; delay: number }) {
  const angle = Math.random() * 360;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  return (
    <motion.div className="absolute w-1 h-1 rounded-full"
      style={{ backgroundColor: color, left: "50%", top: "50%" }}
      initial={{ x, y, opacity: 0 }}
      animate={{ x: [x, -x, x], y: [y, -y, y], opacity: [0, 0.6, 0], scale: [0, 1.5, 0] }}
      transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay, ease: "easeInOut" }} />
  );
}

export default function SharedMemory({ isPulsing, compact }: SharedMemoryProps) {
  const controls = useAnimation();
  useEffect(() => { if (isPulsing) controls.start({ scale: [1, 1.03, 1], transition: { duration: 1, ease: "easeInOut" } }); }, [isPulsing, controls]);

  const ringColors = [
    "rgba(139, 92, 246, 0.12)", "rgba(96, 165, 250, 0.1)",
    "rgba(52, 211, 153, 0.1)", "rgba(251, 191, 36, 0.08)", "rgba(0, 0, 0, 0.04)",
  ];

  const baseSize = compact ? 56 : 120;
  const count = compact ? 6 : 16;
  const particles = Array.from({ length: count }).map((_, i) => ({
    radius: (compact ? 24 : 50) + Math.random() * (compact ? 16 : 40),
    color: ringColors[Math.floor(Math.random() * 4)],
    delay: Math.random() * 5,
  }));

  return (
    <motion.div className="relative flex items-center justify-center"
      style={{ width: compact ? 90 : 220, height: compact ? 90 : 220 }}
      animate={controls}>
      {ringColors.map((color, i) => (
        <Ring key={i} size={baseSize + i * (compact ? 10 : 28)} color={color}
          speed={18 + i * 6} delay={i * 0.3} direction={i % 2 === 0 ? 1 : -1} />
      ))}
      {particles.map((p, i) => <Particle key={i} radius={p.radius} color={p.color} delay={p.delay} />)}
      <div className="flex flex-col items-center gap-0.5 z-20">
        <span className={`font-medium tracking-widest uppercase text-white/80 ${compact ? "text-[8px]" : "text-[10px]"}`}>Shared</span>
        <span className={`font-medium tracking-widest uppercase text-white/80 ${compact ? "text-[8px]" : "text-[10px]"}`}>Memory</span>
      </div>
    </motion.div>
  );
}
