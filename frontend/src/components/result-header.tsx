import { motion } from "framer-motion";
import { Check, Sparkles, Brain } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { useNavigate } from "react-router-dom";

const stages = [
  { label: "Opening Statements", key: "opening" },
  { label: "Rebuttals", key: "rebuttals" },
  { label: "Closing Arguments", key: "closing" },
  { label: "Verdict", key: "verdict" },
];

interface ResultHeaderProps {
  topic: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function ResultHeader({ topic, isDark, onToggleTheme }: ResultHeaderProps) {
  const navigate = useNavigate();
  const textColor = isDark ? "#FFFFFF" : "#1E1E2F";
  const mutedColor = isDark ? "rgba(255,255,255,0.75)" : "#6B7280";

  return (
    <div className="flex items-center justify-between px-8 py-5" style={{ paddingLeft: 32, paddingRight: 32 }}>
      <motion.div className="flex flex-col"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}>
        <motion.button onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer transition-all duration-250"
          whileHover={{ opacity: 0.7 }}>
          <Sparkles size={18} style={{ color: "#7C5CFF" }} />
          <span className="text-sm font-semibold tracking-tight" style={{ color: textColor, fontFamily: "var(--font-heading)" }}>
            Debate Arena
          </span>
        </motion.button>
        <span className="mono text-[11px] tracking-wide mt-0.5" style={{ color: mutedColor }}>
          AI Minds. Real Arguments. Clear Verdicts.
        </span>
      </motion.div>

      <motion.div className="hidden md:flex items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}>
        {stages.map((stage, i) => {
          const isCompleted = i < 3;
          const isCurrent = i === 3;
          return (
            <div key={stage.key} className="flex items-center gap-2.5">
              <div className="relative flex items-center justify-center"
                style={{ width: 22, height: 22 }}>
                {isCompleted && (
                  <div className="rounded-lg flex items-center justify-center"
                    style={{ width: 22, height: 22, backgroundColor: "rgba(87, 211, 140, 0.15)" }}>
                    <Check size={12} style={{ color: "#57D38C" }} />
                  </div>
                )}
                {isCurrent && (
                  <motion.div className="rounded-full"
                    style={{ width: 12, height: 12, backgroundColor: "#7C5CFF", boxShadow: "0 0 12px rgba(124, 92, 255, 0.4)" }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
                )}
              </div>
              <span className="mono text-[10px] uppercase tracking-wider whitespace-nowrap "
                style={{ color: isCompleted ? "rgba(255,255,255,0.7)" : isCurrent ? "#7C5CFF" : "rgba(255,255,255,0.65)" }}>
                {stage.label}
              </span>
            </div>
          );
        })}
        <motion.div className="w-16 h-px absolute bottom-0 left-0"
          style={{ background: "linear-gradient(90deg, #7C5CFF, transparent)" }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }} />
      </motion.div>

      <motion.div className="flex items-center gap-4"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeInOut", delay: 0.15 }}>
        <motion.div className="rounded-2xl px-4 py-2.5 flex items-center gap-3"
          style={{
            backgroundColor: isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.75)",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)"}`,
          }}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.25 }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(124, 92, 255, 0.1)" }}>
            <Brain size={13} style={{ color: "#7C5CFF" }} />
          </div>
          <div className="text-right">
            <p className="mono text-[9px] uppercase tracking-wider" style={{ color: mutedColor }}>Topic</p>
            <p className="text-xs font-medium max-w-[160px] truncate" style={{ color: textColor }}>{topic}</p>
          </div>
        </motion.div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </motion.div>
    </div>
  );
}
