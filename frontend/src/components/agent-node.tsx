import { motion } from "framer-motion";
import type { FC, SVGProps } from "react";

const roles: Record<string, string> = {
  Visionary: "Future Thinker",
  Critic: "Devil's Advocate",
  Generalizer: "Synthesizer",
};

const descriptions: Record<string, string> = {
  Visionary: "Generates bold forward-looking ideas.",
  Critic: "Challenges assumptions and finds flaws.",
  Generalizer: "Synthesizes viewpoints into consensus.",
};

interface AgentNodeProps {
  name: string;
  icon: FC<SVGProps<SVGSVGElement>>;
  color: string;
  glowColor: string;
  isActive: boolean;
  isDark: boolean;
}

export default function AgentNode({ name, icon: Icon, color, glowColor, isActive, isDark }: AgentNodeProps) {
  return (
    <motion.div
      className="flex items-center gap-3.5 w-full rounded-2xl p-3.5 transition-all duration-500 cursor-default"
      style={{
        backgroundColor: isActive
          ? (isDark ? `${glowColor}0a` : `${glowColor}06`)
          : "transparent",
        border: `1px solid ${
          isActive
            ? `${glowColor}22`
            : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
        }`,
      }}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <motion.div
        className="relative flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${glowColor}30, ${glowColor}08)`,
          boxShadow: isActive ? `0 0 16px ${glowColor}30` : "none",
        }}
        animate={{ scale: isActive ? 1.05 : 1 }}
        transition={{ duration: 0.4 }}>
        <Icon width={16} height={16} style={{ color }} />
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight transition-colors duration-300"
            style={{ color: isActive ? color : isDark ? "rgba(255,255,255,0.65)" : "rgba(30,30,47,0.65)" }}>
            {name}
          </span>
          {isActive && (
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        <p className="text-[11px] mt-0.5 mono uppercase tracking-wider transition-colors duration-300"
          style={{ color: isActive ? color : isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
          {roles[name] || name}
        </p>
        <p className="text-[11px] mt-0.5 leading-relaxed transition-colors duration-300"
          style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(30,30,47,0.45)" }}>
          {descriptions[name] || ""}
        </p>
      </div>
    </motion.div>
  );
}
