import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Shield, Network } from "lucide-react";

interface VerdictCardProps {
  winner: string;
  scores: Record<string, number>;
  summary: string;
  isDark: boolean;
}

const agentMeta: Record<string, { icon: typeof Trophy; color: string; label: string }> = {
  visionary: { icon: Sparkles, color: "#8b5cf6", label: "Visionary" },
  critic: { icon: Shield, color: "#60a5fa", label: "Critic" },
  generalizer: { icon: Network, color: "#34d399", label: "Generalizer" },
};

function ScoreCounter({ value, color, delay }: { value: number; color: string; delay: number }) {
  return (
    <motion.span
      className="text-lg font-bold mono tabular-nums"
      style={{ color }}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {value.toFixed(1)}
    </motion.span>
  );
}

export default function VerdictCard({ winner, scores, summary, isDark }: VerdictCardProps) {
  const navigate = useNavigate();
  const winnerMeta = agentMeta[winner] || { icon: Trophy, color: "#fbbf24", label: winner };
  const textColor = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
  const mutedColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
  const borderColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  return (
    <div className="flex flex-col gap-5">
      <h2 className="mono text-[10px] uppercase tracking-[0.15em] px-1 transition-colors duration-300"
        style={{ color: mutedColor }}>
        Verdict
      </h2>

      <motion.div className="rounded-2xl p-6 border text-center"
        style={{ borderColor: `${winnerMeta.color}15`, backgroundColor: isDark ? `${winnerMeta.color}04` : `${winnerMeta.color}03` }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
        <motion.div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${winnerMeta.color}12` }}
          animate={{ boxShadow: [`0 0 0px ${winnerMeta.color}00`, `0 0 24px ${winnerMeta.color}20`, `0 0 0px ${winnerMeta.color}00`] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <Trophy size={24} style={{ color: winnerMeta.color }} />
        </motion.div>

        <p className="mono text-[10px] uppercase tracking-[0.15em] mb-2 transition-colors duration-300"
          style={{ color: mutedColor }}>
          Winner
        </p>
        <h3 className="text-xl font-bold tracking-tight mb-1"
          style={{ color: winnerMeta.color, fontFamily: "var(--font-heading)" }}>
          {winnerMeta.label}
        </h3>
        <p className="text-sm leading-relaxed max-w-xs mx-auto transition-colors duration-300"
          style={{ color: textColor }}>
          {summary}
        </p>
      </motion.div>

      <motion.div className="rounded-2xl p-6 border transition-colors duration-300"
        style={{ borderColor, backgroundColor: isDark ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.5)" }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}>
        <h3 className="mono text-[10px] uppercase tracking-[0.15em] mb-5 transition-colors duration-300"
          style={{ color: mutedColor }}>
          Scores
        </h3>
        <div className="space-y-3">
          {Object.entries(scores).map(([agent, total], i) => {
            const meta = agentMeta[agent];
            if (!meta) return null;
            const isWinner = agent === winner;
            const numScore = typeof total === "number" ? total : 0;
            return (
              <motion.div key={agent}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: isWinner
                    ? (isDark ? `${meta.color}06` : `${meta.color}04`)
                    : "transparent",
                  border: `1px solid ${
                    isWinner
                      ? `${meta.color}15`
                      : "transparent"
                  }`,
                }}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${meta.color}10` }}>
                  <meta.icon size={14} style={{ color: meta.color }} />
                </div>
                <span className="flex-1 text-sm font-medium transition-colors duration-300"
                  style={{ color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)" }}>
                  {meta.label}
                </span>
                <ScoreCounter value={numScore} color={meta.color} delay={0.6 + i * 0.08} />
                {isWinner && (
                  <motion.div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-2.5 mt-2"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}>
        <motion.button
          onClick={() => navigate("/")}
          className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300"
          style={{
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)",
          }}
          whileHover={{ y: -1, backgroundColor: isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.06)" }}
          whileTap={{ scale: 0.98 }}>
          Start New Debate
        </motion.button>
        <motion.button
          onClick={() => window.print()}
          className="w-full py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300"
          style={{
            border: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}`,
            color: mutedColor,
            backgroundColor: "transparent",
          }}
          whileHover={{ color: textColor, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}
          whileTap={{ scale: 0.98 }}>
          Export Summary
        </motion.button>
      </motion.div>
    </div>
  );
}
