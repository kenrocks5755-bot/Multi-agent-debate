import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/theme-context";
import AnimatedBackground from "../components/animated-background";
import ResultHeader from "../components/result-header";
import AgentCard from "../components/agent-card";
import SharedMemory from "../components/shared-memory";
import DebateTimeline from "../components/debate-timeline";
import DebateAnalytics from "../components/debate-analytics";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";

export default function Summary() {
  const [searchParams] = useSearchParams();
  const topic = searchParams.get("topic") || "Untitled Debate";
  const winner = searchParams.get("winner") || "generalizer";
  const summary = searchParams.get("summary") || "The debate has concluded.";
  const { isDark, toggleTheme } = useTheme();

  const scoresParam = searchParams.get("scores");
  let scores: Record<string, number> = { visionary: 8, critic: 7, generalizer: 9 };
  if (scoresParam) { try { scores = JSON.parse(scoresParam); } catch {} }

  const transcriptParam = searchParams.get("transcript");
  let transcript: { speaker: string; round: number; message: string }[] = [];
  if (transcriptParam) { try { transcript = JSON.parse(transcriptParam); } catch {} }

  const betParam = searchParams.get("bet");
  const betPoints = betParam ? parseInt(betParam) : 100;
  const betWon = searchParams.get("betWon") === "true";
  const betPick = searchParams.get("betPick") || "";

  const agentIds = ["visionary", "critic", "generalizer", "moderator"];
  const bg = isDark ? "#0D0D14" : "#FAFAFC";
  const mutedColor = isDark ? "rgba(255,255,255,0.65)" : "#6B7280";

  return (
    <motion.div className="relative min-h-screen flex flex-col"
      style={{ backgroundColor: bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <AnimatedBackground />

      <ResultHeader topic={topic} isDark={isDark} onToggleTheme={toggleTheme} />

      <div className="flex-1 w-full mx-auto" style={{ maxWidth: 1600, padding: "0 16px" }}>
        <motion.div className="flex flex-col md:flex-row gap-6 md:gap-8 pb-10"
          style={{ minHeight: "calc(100vh - 100px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}>

          <div className="flex flex-col gap-5 shrink-0 custom-scrollbar overflow-y-auto"
            style={{ width: "100%", maxWidth: 320, maxHeight: "calc(100vh - 120px)" }}>
            <h2 className="mono text-[10px] uppercase tracking-[0.15em] px-1 pt-1" style={{ color: mutedColor }}>
              AI Agents
            </h2>
            {agentIds.map((id, i) => (
              <AgentCard key={id} id={id} isDark={isDark} index={i} />
            ))}
            <motion.div className="rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 mt-3"
              style={{
                background: isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.75)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.5)"}`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}>
              <SharedMemory isPulsing={false} compact />
              <p className="text-[11px] leading-relaxed text-center" style={{ color: mutedColor }}>
                Insights generated during debate are stored here.
              </p>
            </motion.div>
          </div>

          <div className="flex-1 min-w-0 custom-scrollbar overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 120px)" }}>
            <DebateTimeline transcript={transcript} isDark={isDark} />
          </div>

          <div className="flex flex-col gap-5 shrink-0 custom-scrollbar overflow-y-auto"
            style={{ width: "100%", maxWidth: 380, maxHeight: "calc(100vh - 120px)" }}>
            <DebateAnalytics scores={scores} winner={winner} summary={summary} isDark={isDark} />
            {betPick && (
              <motion.div className="rounded-3xl p-5"
                style={{
                  background: isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.82)",
                  border: `1px solid ${betWon ? "rgba(87,211,140,0.2)" : "rgba(239,68,68,0.2)"}`,
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.4 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: betWon ? "rgba(87,211,140,0.12)" : "rgba(239,68,68,0.12)" }}>
                    {betWon ? <TrendingUp size={14} style={{ color: "#57D38C" }} /> : <TrendingDown size={14} style={{ color: "#EF4444" }} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: betWon ? "#57D38C" : "#EF4444" }}>
                      {betWon ? "You Won!" : "You Lost"}
                    </p>
                    <p className="mono text-[9px] uppercase tracking-wider" style={{ color: mutedColor }}>
                      You bet on {betPick.charAt(0).toUpperCase() + betPick.slice(1)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={12} style={{ color: "#F6C453" }} />
                  <span className="mono text-sm font-bold" style={{ color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)" }}>
                    {betPoints} points
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
