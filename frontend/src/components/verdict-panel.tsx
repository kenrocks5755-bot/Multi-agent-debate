import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Shield, Sparkles, Network, Scale } from "lucide-react";

interface VerdictPanelProps {
  show: boolean;
  winner: string;
  scores: Record<string, number>;
  summary: string;
  isDark: boolean;
}

const agentMeta: Record<string, { icon: typeof Trophy; color: string; label: string }> = {
  visionary: { icon: Sparkles, color: "#7C5CFF", label: "Visionary" },
  critic: { icon: Shield, color: "#5B8CFF", label: "Critic" },
  generalizer: { icon: Network, color: "#57D38C", label: "Generalizer" },
  moderator: { icon: Scale, color: "#F6C453", label: "Moderator" },
};

function ScoreCounter({ value, color }: { value: number; color: string }) {
  return (
    <motion.span
      className="text-lg font-bold mono"
      style={{ color }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {value.toFixed(1)}
    </motion.span>
  );
}

export default function VerdictPanel({ show, winner, scores, summary, isDark }: VerdictPanelProps) {
  const winnerMeta = agentMeta[winner] || { icon: Trophy, color: "#fbbf24", label: winner };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0"
            style={{ backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)" }} />

          <motion.div
            className="relative max-w-lg w-full mx-4 sm:mx-6 rounded-3xl p-6 sm:p-10 border shadow-2xl transition-colors duration-500"
            style={{
              backgroundColor: isDark ? "rgba(20,20,22,0.95)" : "rgba(255,255,255,0.8)",
              borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            }}
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <div className="flex flex-col items-center gap-5 mb-10">
              <motion.div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${winnerMeta.color}15` }}
                animate={{ boxShadow: [`0 0 0px ${winnerMeta.color}00`, `0 0 30px ${winnerMeta.color}25`, `0 0 0px ${winnerMeta.color}00`] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <winnerMeta.icon size={28} style={{ color: winnerMeta.color }} />
              </motion.div>
              <div className="text-center">
                <p className="mono text-[11px] uppercase tracking-[0.15em] mb-2"
                  style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
                  Winner
                </p>
                <h2 className="text-2xl font-bold tracking-tight"
                  style={{ color: winnerMeta.color, fontFamily: "var(--font-heading)" }}>
                  {winnerMeta.label}
                </h2>
                <p className="text-sm mt-1 leading-relaxed max-w-xs mx-auto transition-colors duration-500"
                  style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  {summary}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-500"
                style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
                Scores
              </p>
              {Object.entries(scores).map(([agent, score], i) => {
                const meta = agentMeta[agent] || { icon: Trophy, color: "#888", label: agent };
                const Icon = meta.icon;
                const isWinner = agent === winner;
                const numScore = typeof score === "number" ? score : 0;
                return (
                  <motion.div key={agent}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300"
                    style={{
                      backgroundColor: isWinner
                        ? (isDark ? `${meta.color}08` : `${meta.color}06`)
                        : isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${
                        isWinner
                          ? `${meta.color}18`
                          : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"
                      }`,
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${meta.color}12` }}>
                      <Icon size={14} style={{ color: meta.color }} />
                    </div>
                    <span className="flex-1 text-sm font-medium transition-colors duration-500"
                      style={{ color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.65)" }}>
                      {meta.label}
                    </span>
                    <ScoreCounter value={numScore} color={meta.color} />
                    {isWinner && (
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: meta.color }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
