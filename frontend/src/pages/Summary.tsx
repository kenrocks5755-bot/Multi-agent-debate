import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/theme-context";
import AnimatedBackground from "../components/animated-background";
import ResultHeader from "../components/result-header";
import AgentCard from "../components/agent-card";
import SharedMemory from "../components/shared-memory";
import DebateTimeline from "../components/debate-timeline";
import DebateAnalytics from "../components/debate-analytics";

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
            <motion.div className="rounded-2xl p-6 flex flex-col items-center gap-4 mt-3"
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
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
