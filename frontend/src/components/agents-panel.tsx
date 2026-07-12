import { motion } from "framer-motion";
import { Sparkles, Shield, Network, List } from "lucide-react";

const agents = [
  { id: "all", name: "All Agents", icon: List, color: "#888" },
  { id: "visionary", name: "Visionary", icon: Sparkles, color: "#8b5cf6", role: "Future Thinker" },
  { id: "critic", name: "Critic", icon: Shield, color: "#60a5fa", role: "Devil's Advocate" },
  { id: "generalizer", name: "Generalizer", icon: Network, color: "#34d399", role: "Synthesizer" },
];

interface AgentsPanelProps {
  isDark: boolean;
  selected: string;
  onSelect: (id: string) => void;
  pointCounts: Record<string, number>;
}

export default function AgentsPanel({ isDark, selected, onSelect, pointCounts }: AgentsPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="mono text-[10px] uppercase tracking-[0.15em] px-1 mb-2 transition-colors duration-300"
        style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}>
        Agents
      </h2>
      {agents.map((agent, i) => {
        const isSelected = selected === agent.id;
        return (
          <motion.button key={agent.id} onClick={() => onSelect(agent.id)}
            className="flex items-center gap-3 w-full rounded-2xl p-4 text-left cursor-pointer transition-all duration-300"
            style={{
              border: `1px solid ${isSelected ? `${agent.color}30` : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
              backgroundColor: isSelected ? `${agent.color}06` : "transparent",
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.05 }}
            whileHover={{ backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}
            whileTap={{ scale: 0.98 }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: isSelected ? `${agent.color}14` : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)") }}>
              <agent.icon size={15} style={{ color: agent.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight transition-colors duration-300"
                  style={{ color: isSelected ? agent.color : isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" }}>
                  {agent.name}
                </span>
              </div>
              {"role" in agent && (
                <p className="mono text-[10px] uppercase tracking-wider mt-0.5 transition-colors duration-300"
                  style={{ color: isSelected ? `${agent.color}88` : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}>
                  {agent.role}
                </p>
              )}
              {pointCounts[agent.id] !== undefined && (
                <p className="text-[11px] mt-0.5 transition-colors duration-300"
                  style={{ color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)" }}>
                  {pointCounts[agent.id]} point{pointCounts[agent.id] !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            {isSelected && (
              <motion.div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: agent.color }}
                layoutId="activeAgent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
