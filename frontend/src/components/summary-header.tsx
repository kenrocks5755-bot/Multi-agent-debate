import { motion } from "framer-motion";
import { Check } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { useNavigate } from "react-router-dom";

const stages = ["Opening", "Rebuttals", "Closing", "Verdict"];

interface SummaryHeaderProps {
  topic: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function SummaryHeader({ topic, isDark, onToggleTheme }: SummaryHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-8 py-5 border-b"
      style={{ borderColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }}>
      <motion.button
        onClick={() => navigate("/")}
        className="text-sm font-semibold tracking-tight cursor-pointer transition-colors duration-300"
        style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)", fontFamily: "var(--font-heading)" }}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ opacity: isDark ? 1 : 0.6 }}
      >
        Debate Arena
      </motion.button>

      <motion.div className="hidden md:flex items-center gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}>
        {stages.map((stage, i) => (
          <div key={stage} className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}>
              <Check size={11} className="text-emerald-400" />
            </div>
            <span className="mono text-[10px] uppercase tracking-wider" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}>
              {stage}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.div className="flex items-center gap-4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className="text-right hidden sm:block">
          <p className="mono text-[10px] uppercase tracking-wider transition-colors duration-300"
            style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}>
            Topic
          </p>
          <p className="text-xs font-medium mt-0.5 max-w-[180px] truncate transition-colors duration-300"
            style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
            {topic}
          </p>
        </div>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </motion.div>
    </div>
  );
}
