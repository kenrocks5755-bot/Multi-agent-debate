import { motion } from "framer-motion";
import { useTheme } from "../context/theme-context";

const agents = [
  { label: "Visionary", color: "#7C5CFF", role: "Future Thinker" },
  { label: "Critic", color: "#5B8CFF", role: "Devil's Advocate" },
  { label: "Generalizer", color: "#57D38C", role: "Synthesizer" },
];

export default function LiveStatus() {
  const { isDark } = useTheme();
  const textShadow = isDark ? "0 1px 4px rgba(0,0,0,0.6)" : "0 1px 3px rgba(0,0,0,0.1)";

  return (
    <motion.div className="flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.4 }}>
      <div className="flex items-center gap-5">
        {agents.map((agent, i) => (
          <motion.div key={agent.label} className="flex items-center gap-2"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 1.45 + i * 0.08 }}>
            <motion.div className="w-2 h-2 rounded-full"
              style={{ backgroundColor: agent.color, boxShadow: `0 0 8px ${agent.color}60` }}
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }} />
            <span className="text-xs font-medium tracking-tight"
              style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(30,30,47,0.55)", textShadow }}>
              {agent.label}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#57D38C" }} />
        <span className="mono text-[10px] uppercase tracking-[0.15em]"
          style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(30,30,47,0.35)", textShadow }}>
          All Agents Ready
        </span>
      </div>
    </motion.div>
  );
}
