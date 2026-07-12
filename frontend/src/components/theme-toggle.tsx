import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
      }}
      whileHover={{ scale: 1.04, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}
      whileTap={{ scale: 0.96 }}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? <Sun size={14} className="text-white/40" /> : <Moon size={14} className="text-black/40" />}
    </motion.button>
  );
}
