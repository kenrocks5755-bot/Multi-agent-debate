import { motion } from "framer-motion";
import { Sparkles, Shield, Network, Scale } from "lucide-react";

const agentMeta: Record<string, { icon: typeof Sparkles; name: string; role: string; description: string; color: string }> = {
  visionary: { icon: Sparkles, name: "Visionary", role: "Future Thinker", description: "Generates bold long-term ideas.", color: "#7C5CFF" },
  critic: { icon: Shield, name: "Critic", role: "Devil's Advocate", description: "Challenges assumptions.", color: "#5B8CFF" },
  generalizer: { icon: Network, name: "Generalizer", role: "Synthesizer", description: "Builds consensus.", color: "#57D38C" },
  moderator: { icon: Scale, name: "Moderator", role: "Judge", description: "Evaluates arguments.", color: "#F6C453" },
};

interface AgentCardProps {
  id: string;
  isDark: boolean;
  index: number;
}

export default function AgentCard({ id, isDark, index }: AgentCardProps) {
  const meta = agentMeta[id];
  if (!meta) return null;
  const Icon = meta.icon;
  const isActive = id === "visionary";
  const bgColor = isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.75)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)";
  const textColor = isDark ? "#FFFFFF" : "#1E1E2F";
  const mutedColor = isDark ? "rgba(255,255,255,0.75)" : "#6B7280";

  return (
    <motion.div className="rounded-2xl p-5 flex items-start gap-4 cursor-default transition-all duration-250"
      style={{ background: bgColor, border: `1px solid ${borderColor}` }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + index * 0.06, ease: "easeInOut" }}
      whileHover={{ y: -2, boxShadow: `0 8px 30px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.06)"}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, ${meta.color}20, ${meta.color}08)` }}>
        <Icon size={16} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: textColor, fontFamily: "var(--font-heading)" }}>
              {meta.name}
            </span>
            <p className="mono text-[9px] uppercase tracking-wider mt-0.5" style={{ color: mutedColor }}>
              {meta.role}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <motion.div className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: isActive ? meta.color : "rgba(255,255,255,0.3)" }}
              animate={isActive ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
            <span className="mono text-[9px] uppercase tracking-wider" style={{ color: isActive ? meta.color : "rgba(255,255,255,0.65)" }}>
              {isActive ? "Active" : "Waiting"}
            </span>
          </div>
        </div>
        <p className="text-[12px] leading-relaxed mt-2 " style={{ color: mutedColor }}>
          {meta.description}
        </p>
      </div>
    </motion.div>
  );
}
