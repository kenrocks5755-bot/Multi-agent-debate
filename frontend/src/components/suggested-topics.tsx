import { motion } from "framer-motion";
import { useTheme } from "../context/theme-context";

const topics = [
  { icon: "🤖", label: "AI replacing teachers" },
  { icon: "🛰", label: "Colonizing Mars" },
  { icon: "⚖", label: "Capital Punishment" },
  { icon: "🧬", label: "Gene Editing" },
  { icon: "💰", label: "Universal Basic Income" },
  { icon: "🌍", label: "Universal Healthcare" },
];

interface SuggestedTopicsProps {
  onSelect: (topic: string) => void;
}

export default function SuggestedTopics({ onSelect }: SuggestedTopicsProps) {
  const { isDark } = useTheme();
  const textShadow = isDark ? "0 1px 4px rgba(0,0,0,0.6)" : "0 1px 3px rgba(0,0,0,0.1)";

  return (
    <motion.div className="flex flex-wrap items-center justify-center gap-2.5 max-w-[620px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 1.2 }}>
      {topics.map((topic, i) => (
        <motion.button
          key={topic.label}
          onClick={() => onSelect(topic.label)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-300"
          style={{
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.35)",
            backdropFilter: "blur(8px)",
            color: isDark ? "rgba(255,255,255,0.6)" : "rgba(30,30,47,0.55)",
            textShadow,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -2, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)", color: isDark ? "rgba(255,255,255,0.8)" : "rgba(30,30,47,0.8)" }}
          whileTap={{ scale: 0.96 }}>
          <span style={{ fontSize: 11 }}>{topic.icon}</span>
          <span>{topic.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
