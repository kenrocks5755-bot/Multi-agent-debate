import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield, Network } from "lucide-react";

const agentMeta: Record<string, { name: string; icon: typeof Sparkles; color: string }> = {
  visionary: { name: "Visionary", icon: Sparkles, color: "#8b5cf6" },
  critic: { name: "Critic", icon: Shield, color: "#60a5fa" },
  generalizer: { name: "Generalizer", icon: Network, color: "#34d399" },
};

interface TranscriptEntry { speaker: string; round: number; message: string }

interface AgentPointsViewProps {
  transcript: TranscriptEntry[];
  selectedAgent: string;
  isDark: boolean;
}

function extractBullets(message: string): string[] {
  return message.split("\n").map(l => l.trim()).filter(l => l.startsWith("-") || l.startsWith("*")).map(l => l.replace(/^[-*]\s*/, ""));
}

export default function AgentPointsView({ transcript, selectedAgent, isDark }: AgentPointsViewProps) {
  const filtered = useMemo(() => {
    const entries = selectedAgent === "all"
      ? transcript.filter(e => e.speaker !== "moderator")
      : transcript.filter(e => e.speaker === selectedAgent);
    const grouped: Record<number, { speaker: string; bullets: string[] }[]> = {};
    for (const entry of entries) {
      if (!grouped[entry.round]) grouped[entry.round] = [];
      const bullets = extractBullets(entry.message);
      if (bullets.length > 0) grouped[entry.round].push({ speaker: entry.speaker, bullets });
    }
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
  }, [transcript, selectedAgent]);

  const totalPoints = useMemo(() => filtered.reduce((sum, [, entries]) => sum + entries.reduce((s, e) => s + e.bullets.length, 0), 0), [filtered]);
  const textColor = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)";
  const mutedColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-300"
          style={{ color: mutedColor }}>
          {selectedAgent === "all" ? "All Arguments" : `${agentMeta[selectedAgent]?.name || "Agent"}`}
        </h2>
        <span className="mono text-[10px] uppercase tracking-wider transition-colors duration-300" style={{ color: mutedColor }}>
          {totalPoints} point{totalPoints !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-xs transition-colors duration-300" style={{ color: mutedColor }}>No arguments found</p>
          </div>
        )}
        {filtered.map(([round, entries], ri) => (
          <motion.div key={round}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: ri * 0.06 }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="mono text-[10px] uppercase tracking-wider transition-colors duration-300"
                style={{ color: mutedColor }}>
                Round {round}
              </span>
              <div className="flex-1 h-px transition-colors duration-300"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
            </div>
            <div className="space-y-3">
              {entries.map((entry, ei) => {
                const meta = agentMeta[entry.speaker];
                const color = meta?.color || "#888";
                const Icon = meta?.icon || Sparkles;
                return (
                  <motion.div key={`${round}-${ei}`}
                    className="rounded-2xl p-5 border transition-all duration-300"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.5)",
                      borderColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                      borderLeftColor: color, borderLeftWidth: 3,
                    }}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: ei * 0.04 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}12` }}>
                        <Icon size={12} style={{ color }} />
                      </div>
                      <span className="text-xs font-bold tracking-tight" style={{ color }}>{entry.speaker.toUpperCase()}</span>
                    </div>
                    <div className="space-y-2.5">
                      {entry.bullets.map((bullet, bi) => (
                        <div key={bi} className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0" style={{ backgroundColor: color, opacity: 0.4 }} />
                          <span className="text-sm leading-relaxed transition-colors duration-300" style={{ color: textColor }}>
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
