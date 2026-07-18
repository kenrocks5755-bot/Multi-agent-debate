import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Network, ArrowRight } from "lucide-react";
import { useTheme } from "../context/theme-context";
import TopicHeader from "../components/topic-header";
import SharedMemory from "../components/shared-memory";
import AgentNode from "../components/agent-node";
import SpeechCard from "../components/speech-card";
import VerdictPanel from "../components/verdict-panel";
import ThemeToggle from "../components/theme-toggle";

type Agent = "visionary" | "critic" | "generalizer";
type Phase = "intro" | "debating" | "verdict" | "done";

const agentMeta: Record<string, { name: string; icon: typeof Sparkles; color: string; glow: string }> = {
  visionary: { name: "Visionary", icon: Sparkles, color: "#7C5CFF", glow: "rgba(124, 92, 255, " },
  critic: { name: "Critic", icon: Shield, color: "#5B8CFF", glow: "rgba(91, 140, 255, " },
  generalizer: { name: "Generalizer", icon: Network, color: "#57D38C", glow: "rgba(87, 211, 140, " },
};

const agentOrder = ["visionary", "critic", "generalizer"] as const;

const debateSteps = [
  { round: 1, agent: "visionary" as Agent },
  { round: 1, agent: "critic" as Agent },
  { round: 1, agent: "generalizer" as Agent },
  { round: 2, agent: "visionary" as Agent },
  { round: 2, agent: "critic" as Agent },
  { round: 2, agent: "generalizer" as Agent },
  { round: 3, agent: "visionary" as Agent },
  { round: 3, agent: "critic" as Agent },
  { round: 3, agent: "generalizer" as Agent },
];

export default function Debate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topic = searchParams.get("topic") || "Untitled Debate";
  const { isDark, toggleTheme } = useTheme();

  const [phase, setPhase] = useState<Phase>("intro");
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [doneTyping, setDoneTyping] = useState(false);
  const [verdict, setVerdict] = useState<{ winner: string; scores: Record<string, number>; summary: string } | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);
  const [memoryPulse, setMemoryPulse] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [fullTranscript, setFullTranscript] = useState<{ speaker: string; round: number; message: string }[]>([]);
  const [roundTransition, setRoundTransition] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyRef = useRef<{ speaker: string; round: number; message: string }[]>([]);
  const stepRef = useRef(0);

  const startTypewriter = useCallback((text: string) => {
    setCurrentMessage("");
    setIsSpeaking(true);
    setDoneTyping(false);
    let idx = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      idx++;
      setCurrentMessage(text.slice(0, idx));
      if (idx >= text.length) {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
        setIsSpeaking(false);
        setDoneTyping(true);
      }
    }, 8);
  }, []);

  const fetchNext = useCallback(async () => {
    const stepIdx = stepRef.current;
    stepRef.current += 1;
    const apiUrl = import.meta.env.VITE_API_URL || "";

    if (stepIdx >= debateSteps.length) {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/verdict?topic=${encodeURIComponent(topic)}&history=${encodeURIComponent(JSON.stringify(historyRef.current))}`, { signal: AbortSignal.timeout(20000) });
        if (!res.ok) { setConnectionError(true); setIsLoading(false); return; }
        const data = await res.json();
        setVerdict({ winner: data.winner, scores: data.scores, summary: data.summary });
        setFullTranscript(prev => [...prev, { speaker: "moderator", round: 3, message: data.summary }]);
        setTimeout(() => setShowVerdict(true), 1000);
        setPhase("verdict");
      } catch { setConnectionError(true); }
      setIsLoading(false);
      return;
    }

    const step = debateSteps[stepIdx];
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/step?topic=${encodeURIComponent(topic)}&agent=${step.agent}&round=${step.round}&history=${encodeURIComponent(JSON.stringify(historyRef.current))}`, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) { setConnectionError(true); setIsLoading(false); return; }
      const data = await res.json();
      const entry = { speaker: data.agent, round: data.round, message: data.message };
      historyRef.current = [...historyRef.current, entry];
      setFullTranscript(prev => [...prev, entry]);
      setCurrentSpeaker(data.agent);
      setCurrentRound(data.round);
      if (step.round === 2 || step.round === 3) setRoundTransition(true);
      startTypewriter(data.message);
      setPhase("debating");
    } catch { setConnectionError(true); }
    setIsLoading(false);
  }, [topic, startTypewriter]);

  const handleContinue = useCallback(() => {
    if (isLoading) return;
    setMemoryPulse(true);
    setTimeout(() => { setMemoryPulse(false); }, 350);
    fetchNext();
  }, [isLoading, fetchNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (doneTyping && (e.key === " " || e.key === "Enter")) { e.preventDefault(); handleContinue(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doneTyping, handleContinue]);

  useEffect(() => {
    setPhase("intro");
    stepRef.current = 0;
    historyRef.current = [];
    setRoundTransition(false);
    const timer = setTimeout(() => fetchNext(), 500);
    return () => { clearTimeout(timer); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [topic, fetchNext]);

  useEffect(() => {
    if (showVerdict && verdict) {
      const timer = setTimeout(() => {
        navigate(`/summary?topic=${encodeURIComponent(topic)}&winner=${encodeURIComponent(verdict.winner)}&summary=${encodeURIComponent(verdict.summary)}&scores=${encodeURIComponent(JSON.stringify(verdict.scores))}&transcript=${encodeURIComponent(JSON.stringify(fullTranscript))}`);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showVerdict, verdict, fullTranscript, topic, navigate]);

  const currentAgent = (currentSpeaker === "visionary" || currentSpeaker === "critic" || currentSpeaker === "generalizer")
    ? currentSpeaker as Agent : null;
  const bg = isDark ? "#0D0D14" : "#FAFAFC";

  return (
      <motion.div className="relative w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500"
        style={{ backgroundColor: bg }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>

      <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-50"><ThemeToggle isDark={isDark} onToggle={toggleTheme} /></div>

      <TopicHeader topic={topic} currentRound={currentRound} totalRounds={3} isDark={isDark} />

      <AnimatePresence>
        {roundTransition && (
          <motion.div className="absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-40"
            initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <div className="rounded-2xl px-5 py-2.5 border shadow-sm transition-colors duration-500"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.6)", borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}>
              <span className="mono text-[11px] uppercase tracking-wider transition-colors duration-500"
                style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                Round {currentRound} of 3
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col md:flex-row">
        <motion.div className="hidden md:flex w-[240px] shrink-0 flex-col items-center gap-4 pt-8 px-4 transition-colors duration-500"
          style={{ borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}>
          {agentOrder.map((key) => (
            <AgentNode key={key} name={agentMeta[key].name} icon={agentMeta[key].icon}
              color={agentMeta[key].color} glowColor={agentMeta[key].glow}
              isActive={currentSpeaker === key && (isSpeaking || doneTyping)} isDark={isDark} />
          ))}
          <motion.div className="mt-4" style={{ opacity: isDark ? 0.7 : 0.6 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}>
            <SharedMemory isPulsing={memoryPulse} compact />
          </motion.div>
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-10 pb-16">
          {phase === "intro" && !currentAgent && (
            <motion.div key="loading" className="flex flex-col items-center gap-4"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 animate-spin"
                  style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderTopColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }} />
              </div>
              <span className="text-sm font-medium transition-colors duration-500"
                style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                Initializing agents...
              </span>
            </motion.div>
          )}
          {currentAgent && (isSpeaking || doneTyping) && (
            <div key={`${currentAgent}-${currentRound}`} className="flex flex-col items-center gap-8 w-full">
              <SpeechCard speaker={agentMeta[currentAgent].name} message={currentMessage}
                color={agentMeta[currentAgent].color} round={currentRound} isDark={isDark} />
              {doneTyping && (
                <motion.button onClick={handleContinue}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                    color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  whileHover={{ y: -1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" }}
                  whileTap={{ scale: 0.98 }}>
                  <ArrowRight size={14} />
                  <span>{isLoading ? "Loading..." : "Continue"}</span>
                </motion.button>
              )}
            </div>
          )}
          {connectionError && (
            <div className="rounded-2xl px-5 py-3 border"
              style={{ backgroundColor: isDark ? "rgba(220,38,38,0.08)" : "rgba(220,38,38,0.04)", borderColor: isDark ? "rgba(220,38,38,0.12)" : "rgba(220,38,38,0.08)" }}>
              <p className="text-sm" style={{ color: isDark ? "rgba(248,113,113,0.8)" : "rgb(220,38,38)" }}>
                Could not connect to backend.
              </p>
            </div>
          )}
        </div>
      </div>

      <VerdictPanel show={showVerdict} winner={verdict?.winner || ""} scores={verdict?.scores || {}} summary={verdict?.summary || ""} isDark={isDark} />
    </motion.div>
  );
}
