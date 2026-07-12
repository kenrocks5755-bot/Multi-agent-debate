import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface TopicHeaderProps {
  topic: string;
  currentRound: number;
  totalRounds: number;
  isDark: boolean;
}

export default function TopicHeader({ topic, currentRound, totalRounds, isDark }: TopicHeaderProps) {
  const textColor = isDark ? "rgba(255,255,255,0.85)" : "#1E1E2F";
  const mutedColor = isDark ? "rgba(255,255,255,0.45)" : "#6B7280";

  return (
    <motion.div className="flex items-center justify-between px-8 pt-6 pb-4 transition-colors duration-500"
      style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}>
      <motion.div className="flex items-center gap-3"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}>
        <Sparkles size={16} style={{ color: "#7C5CFF" }} />
        <h1 className="text-lg font-semibold tracking-tight transition-colors duration-500"
          style={{ color: textColor, fontFamily: "var(--font-heading)" }}>
          {topic}
        </h1>
      </motion.div>
      <motion.div className="flex items-center gap-4"
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalRounds }).map((_, i) => (
            <motion.div key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i < currentRound ? 24 : 8,
                backgroundColor: i < currentRound
                  ? (isDark ? "rgba(255,255,255,0.8)" : "#1E1E2F")
                  : i === currentRound
                  ? (isDark ? "rgba(255,255,255,0.25)" : "rgba(30,30,47,0.25)")
                  : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
              }}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
              layout />
          ))}
        </div>
        <span className="mono text-[12px] uppercase tracking-wider" style={{ color: mutedColor }}>
          {currentRound}/{totalRounds}
        </span>
      </motion.div>
    </motion.div>
  );
}
