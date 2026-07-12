import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight } from "lucide-react";

interface TopicInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function TopicInput({ value, onChange }: TopicInputProps) {
  const navigate = useNavigate();
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const handleStart = useCallback(() => {
    if (value.trim()) {
      navigate(`/debate?topic=${encodeURIComponent(value.trim())}`);
    }
  }, [value, navigate]);

  const barBg = focused
    ? "rgba(224, 242, 254, 0.85)"
    : hovered
      ? "rgba(224, 242, 254, 0.65)"
      : "rgba(224, 242, 254, 0.45)";
  const borderColor = focused
    ? "#5B8CFF"
    : hovered
      ? "rgba(91, 140, 255, 0.4)"
      : "rgba(91, 140, 255, 0.25)";

  const shadow = focused
    ? "0 0 0 3px rgba(91, 140, 255, 0.12), 0 4px 20px rgba(91, 140, 255, 0.08)"
    : "0 2px 8px rgba(0,0,0,0.02)";

  return (
    <motion.div className="w-full max-w-[500px] mx-auto"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1.05 }}>
      <motion.div className="flex items-center gap-3 rounded-[16px] transition-all duration-400 px-4"
        style={{ height: 48, background: barBg, border: `1px solid ${borderColor}`, boxShadow: shadow, backdropFilter: "blur(20px)" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>
        <Lightbulb size={13} className="shrink-0 transition-all duration-300"
          style={{ color: focused ? "#5B8CFF" : "rgba(0,0,0,0.15)" }} />

        <input
          className="flex-1 bg-transparent border-none outline-none transition-colors duration-300"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 500,
            color: "rgba(0,0,0,0.8)",
          }}
          placeholder="What should the agents debate today?"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter") handleStart(); }}
        />

        <motion.button
          onClick={handleStart}
          className="flex items-center justify-center cursor-pointer shrink-0 transition-all duration-300"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: focused || value.trim() ? "linear-gradient(135deg, #5B8CFF, #4A7DFF)" : "rgba(0,0,0,0.04)",
            color: focused || value.trim() ? "#fff" : "rgba(0,0,0,0.2)",
          }}
          whileHover={{ scale: 1.04, boxShadow: "0 4px 12px rgba(91, 140, 255, 0.25)" }}
          whileTap={{ scale: 0.95 }}>
          <ArrowRight size={15} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
