import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield, Network, Trophy, Share, Download, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const agentMeta: Record<string, { icon: typeof Sparkles; name: string; color: string }> = {
  visionary: { icon: Sparkles, name: "Visionary", color: "#7C5CFF" },
  critic: { icon: Shield, name: "Critic", color: "#5B8CFF" },
  generalizer: { icon: Network, name: "Generalizer", color: "#57D38C" },
};

const metricLabels = ["Clarity", "Logic", "Evidence", "Persuasiveness"];

function generateMetrics(totalScore: number): number[] {
  return metricLabels.map((_, i) => {
    const variance = (Math.sin(totalScore * (i + 1) * 1.5) * 0.15 + 0.85);
    return Math.min(10, Math.max(1, Math.round((totalScore * variance) * 10) / 10));
  });
}

function ScoreBar({ label, value, color, delay, maxValue, isDark }: { label: string; value: number; color: string; delay: number; maxValue: number; isDark: boolean }) {
  const pct = (value / maxValue) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="mono text-[9px] uppercase tracking-wider w-[90px] shrink-0 " style={{ color: isDark ? "rgba(255,255,255,0.70)" : "rgba(107,114,128,0.8)" }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(0,0,0,0.04)" }}>
        <motion.div className="h-full rounded-full relative"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)`, width: 0 }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay, ease: "easeInOut" }}>
          <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}40` }} />
        </motion.div>
      </div>
      <motion.span className="mono text-[11px] font-semibold tabular-nums w-7 text-right"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.15 }}>
        {value.toFixed(1)}
      </motion.span>
    </div>
  );
}

interface DebateAnalyticsProps {
  scores: Record<string, number>;
  winner: string;
  summary: string;
  isDark: boolean;
}

export default function DebateAnalytics({ scores, winner, summary, isDark }: DebateAnalyticsProps) {
  const navigate = useNavigate();

  const textColor = isDark ? "#FFFFFF" : "#1E1E2F";
  const mutedColor = isDark ? "rgba(255,255,255,0.75)" : "#6B7280";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const bgColor = isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.82)";

  const sortedAgents = useMemo(() => {
    return Object.entries(scores)
      .filter(([id]) => id !== "moderator")
      .sort(([, a], [, b]) => b - a);
  }, [scores]);

  const winnerMeta = agentMeta[winner] || { icon: Trophy, name: winner, color: "#F6C453" };

  return (
    <div className="flex flex-col gap-6">
      <motion.div className="rounded-3xl p-7"
        style={{ background: bgColor, border: `1px solid ${borderColor}` }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: "easeInOut" }}>
        <h2 className="text-sm font-semibold tracking-tight mb-6" style={{ color: textColor, fontFamily: "var(--font-heading)" }}>
          Debate Analytics
        </h2>

        <div className="space-y-6">
          {sortedAgents.map(([id, totalScore], ai) => {
            const meta = agentMeta[id];
            if (!meta) return null;
            const metrics = generateMetrics(totalScore);
            const Icon = meta.icon;
            const isWinner = id === winner;
            return (
              <motion.div key={id}
                className="rounded-xl p-5 transition-all duration-250"
                style={{
                  background: isWinner ? `${meta.color}06` : (isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.015)"),
                  border: `1px solid ${isWinner ? `${meta.color}15` : borderColor}`,
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + ai * 0.08 }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${meta.color}12` }}>
                      <Icon size={14} style={{ color: meta.color }} />
                    </div>
                    <div>
                      <span className="text-sm font-semibold tracking-tight" style={{ color: textColor }}>{meta.name}</span>
                      {isWinner && (
                        <span className="mono text-[8px] uppercase tracking-wider ml-2 px-1.5 py-0.5 rounded"
                          style={{ background: `${meta.color}15`, color: meta.color }}>
                          Winner
                        </span>
                      )}
                    </div>
                  </div>
                  <motion.span className="text-lg font-bold mono tabular-nums" style={{ color: meta.color }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + ai * 0.08, ease: "easeInOut" }}>
                    {totalScore.toFixed(1)}
                  </motion.span>
                </div>
                <div className="space-y-2.5">
                  {metrics.map((val, mi) => (
                    <ScoreBar key={mi} label={metricLabels[mi]} value={val} color={meta.color}
                      delay={0.5 + ai * 0.08 + mi * 0.05} maxValue={10} isDark={isDark} />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div className="rounded-3xl p-7 text-center relative overflow-hidden"
        style={{
          background: isDark ? `${winnerMeta.color}04` : `linear-gradient(135deg, ${winnerMeta.color}03, transparent)`,
          border: `1px solid ${isDark ? `${winnerMeta.color}10` : `${winnerMeta.color}15`}`,
          boxShadow: isDark ? "0 20px 60px rgba(0,0,0,0.3)" : "0 20px 60px rgba(0,0,0,0.05)",
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35, ease: "easeInOut" }}>
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${winnerMeta.color}15, transparent 60%)`,
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />

        <div className="relative z-10">
          <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `${winnerMeta.color}12` }}
            animate={{ boxShadow: [`0 0 0px ${winnerMeta.color}00`, `0 0 24px ${winnerMeta.color}20`, `0 0 0px ${winnerMeta.color}00`] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            <Trophy size={24} style={{ color: winnerMeta.color }} />
          </motion.div>
          <p className="mono text-[9px] uppercase tracking-wider mb-2" style={{ color: mutedColor }}>Winner</p>
          <h3 className="text-xl font-bold mb-1 font-heading" style={{ color: winnerMeta.color }}>
            {winnerMeta.name}
          </h3>
          <p className="text-[11px] leading-relaxed max-w-[240px] mx-auto " style={{ color: mutedColor }}>
            {summary}
          </p>
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-3 pt-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45, ease: "easeInOut" }}>
        <motion.button onClick={() => navigate("/")}
          className="w-full py-4 rounded-2xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-250 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #7C5CFF, #5B8CFF)",
            color: "#fff",
          }}
          whileHover={{ y: -1, boxShadow: "0 8px 30px rgba(124, 92, 255, 0.3)" }}
          whileTap={{ scale: 0.98 }}>
          <ArrowRight size={14} />
          <span>Start New Debate</span>
        </motion.button>

        <motion.button
          className="w-full py-3.5 rounded-2xl text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all duration-250"
          style={{
            background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.82)",
            border: `1px solid ${borderColor}`,
            color: textColor,
          }}
          whileHover={{ y: -1, background: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)" }}
          whileTap={{ scale: 0.98 }}>
          <Share size={13} />
          <span>Share Results</span>
        </motion.button>

        <motion.button
          className="w-full py-2.5 rounded-2xl text-sm font-medium cursor-pointer flex items-center justify-center gap-2 transition-all duration-250"
          style={{
            border: `1px solid transparent`,
            color: isDark ? "rgba(255,255,255,0.7)" : "#6B7280",
            background: "transparent",
          }}
          whileHover={{ color: textColor }}
          whileTap={{ scale: 0.98 }}>
          <Download size={13} />
          <span>Download Transcript</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
