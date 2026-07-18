import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Network, ArrowRight, Swords, ThumbsDown, Zap } from "lucide-react";
import { useTheme } from "../context/theme-context";
import TopicHeader from "../components/topic-header";
import SharedMemory from "../components/shared-memory";
import AgentNode from "../components/agent-node";
import SpeechCard from "../components/speech-card";
import VerdictPanel from "../components/verdict-panel";
import ThemeToggle from "../components/theme-toggle";

type Agent = "visionary" | "critic" | "generalizer";
type Phase = "intro" | "betting" | "debating" | "verdict" | "micdrop" | "done";

const agentMeta: Record<string, { name: string; icon: typeof Sparkles; color: string; glow: string }> = {
  visionary: { name: "Visionary", icon: Sparkles, color: "#7C5CFF", glow: "rgba(124, 92, 255, " },
  critic: { name: "Critic", icon: Shield, color: "#5B8CFF", glow: "rgba(91, 140, 255, " },
  generalizer: { name: "Generalizer", icon: Network, color: "#57D38C", glow: "rgba(87, 211, 140, " },
};

const agentOrder = ["critic", "visionary", "generalizer"] as const;

const debateSteps = [
  { round: 1, agent: "critic" as Agent },
  { round: 1, agent: "visionary" as Agent },
  { round: 1, agent: "generalizer" as Agent },
  { round: 2, agent: "critic" as Agent },
  { round: 2, agent: "visionary" as Agent },
  { round: 2, agent: "generalizer" as Agent },
  { round: 3, agent: "critic" as Agent },
  { round: 3, agent: "visionary" as Agent },
  { round: 3, agent: "generalizer" as Agent },
];

const WILDCARDS = [
  "You may not use the letter 'E' in your response. No words containing 'e'.",
  "Explain your point using only pirate slang. Arrr!",
  "Speak as if you are a medieval knight delivering a royal decree.",
  "You are a dramatic Shakespearean actor. Deliver your argument in iambic pentameter.",
  "You are a robot with a glitch. Every third word must be 'BEEP'.",
  "Explain your argument as if you're teaching it to a five-year-old.",
  "You are a conspiracy theorist. Everything is connected to something sinister.",
  "Speak only in questions.",
];

export default function Debate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const topic = searchParams.get("topic") || "Untitled Debate";
  const { isDark, toggleTheme } = useTheme();

  const [phase, setPhase] = useState<Phase>("betting");
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

  const [credibility, setCredibility] = useState<Record<string, number>>({
    visionary: 100, critic: 100, generalizer: 100,
  });
  const [statusEffects, setStatusEffects] = useState<Record<string, string>>({});
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  const [betPoints, setBetPoints] = useState(100);
  const [betPick, setBetPick] = useState<Agent | null>(null);
  const [betPlaced, setBetPlaced] = useState(false);
  const [betWon, setBetWon] = useState(false);

  const [wildcard, setWildcard] = useState("");
  const [wildcardActive, setWildcardActive] = useState(false);
  const [wildcardRevealed, setWildcardRevealed] = useState(false);

  const [heckleText, setHeckleText] = useState("");
  const [showHeckleInput, setShowHeckleInput] = useState(false);

  const [roasts, setRoasts] = useState("");

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

  const applyWildcard = useCallback(() => {
    const pick = WILDCARDS[Math.floor(Math.random() * WILDCARDS.length)];
    setWildcard(pick);
    setWildcardActive(true);
    setWildcardRevealed(true);
    setTimeout(() => setWildcardRevealed(false), 4000);
  }, []);

  const fetchNext = useCallback(async () => {
    const stepIdx = stepRef.current;
    stepRef.current += 1;
    const apiUrl = import.meta.env.VITE_API_URL || "";

    if (stepIdx === 3 && !wildcardActive) {
      applyWildcard();
    }

    if (stepIdx >= debateSteps.length) {
      setIsLoading(true);
      try {
        const res = await fetch(`${apiUrl}/verdict?topic=${encodeURIComponent(topic)}&history=${encodeURIComponent(JSON.stringify(historyRef.current))}`, { signal: AbortSignal.timeout(20000) });
        if (!res.ok) { setConnectionError(true); setIsLoading(false); return; }
        const data = await res.json();
        setVerdict({ winner: data.winner, scores: data.scores, summary: data.summary });
        setFullTranscript(prev => [...prev, { speaker: "moderator", round: 3, message: data.summary }]);

        if (betPick === data.winner) {
          setBetWon(true);
          setBetPoints(prev => prev + 200);
        } else {
          setBetPoints(prev => Math.max(0, prev - 50));
        }

        setTimeout(() => setShowVerdict(true), 1000);
        setPhase("verdict");
      } catch { setConnectionError(true); }
      setIsLoading(false);
      return;
    }

    const step = debateSteps[stepIdx];
    setIsLoading(true);
    try {
      const activeWildcard = (step.round === 2 && wildcardActive) ? wildcard : "";
      const res = await fetch(`${apiUrl}/step?topic=${encodeURIComponent(topic)}&agent=${step.agent}&round=${step.round}&history=${encodeURIComponent(JSON.stringify(historyRef.current))}&wildcard=${encodeURIComponent(activeWildcard)}&mood=&heckle=&credibility=${encodeURIComponent(JSON.stringify(credibility))}`, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) { setConnectionError(true); setIsLoading(false); return; }
      const data = await res.json();
      const entry = { speaker: data.agent, round: data.round, message: data.message };
      historyRef.current = [...historyRef.current, entry];
      setFullTranscript(prev => [...prev, entry]);
      setCurrentSpeaker(data.agent);
      setCurrentRound(data.round);
      if (step.round === 2 || step.round === 3) setRoundTransition(true);

      const prevStreak = streaks[data.agent] || 0;
      const newStreak = prevStreak + 1;
      setStreaks(prev => ({ ...prev, [data.agent]: newStreak }));
      const newEffects: Record<string, string> = {};
      if (newStreak >= 3) newEffects[data.agent] = "On Fire";
      const victim = agentOrder.find(a => a !== data.agent);
      if (victim && newStreak >= 3) newEffects[victim] = "Stunned";
      setStatusEffects(newEffects);

      const otherAgents = agentOrder.filter(a => a !== data.agent);
      const credibilityDrop = Math.floor(Math.random() * 5) + 3;
      setCredibility(prev => {
        const next = { ...prev };
        for (const oa of otherAgents) {
          next[oa] = Math.max(0, next[oa] - credibilityDrop);
        }
        return next;
      });

      startTypewriter(data.message);
      setPhase("debating");
      setShowHeckleInput(true);
    } catch { setConnectionError(true); }
    setIsLoading(false);
  }, [topic, startTypewriter, credibility, streaks, wildcard, wildcardActive, applyWildcard, betPick]);

  const sendHeckle = useCallback(() => {
    if (!heckleText.trim()) return;
    const entry = { speaker: "audience" as const, round: currentRound, message: heckleText.trim() };
    historyRef.current = [...historyRef.current, entry as any];
    setFullTranscript(prev => [...prev, entry as any]);
    setHeckleText("");
    setShowHeckleInput(false);
  }, [heckleText, currentRound]);

  const fetchRoasts = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/micdrop?topic=${encodeURIComponent(topic)}&history=${encodeURIComponent(JSON.stringify(historyRef.current))}`, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) { setIsLoading(false); return; }
      const data = await res.json();
      setRoasts(data.roasts);
      setPhase("micdrop");
    } catch {}
    setIsLoading(false);
  }, [topic]);

  const handleContinue = useCallback(() => {
    if (isLoading) return;
    setMemoryPulse(true);
    setTimeout(() => { setMemoryPulse(false); }, 350);
    fetchNext();
  }, [isLoading, fetchNext]);

  const startDebate = useCallback(() => {
    if (!betPick) return;
    setBetPlaced(true);
    setPhase("intro");
    stepRef.current = 0;
    historyRef.current = [];
    setCredibility({ visionary: 100, critic: 100, generalizer: 100 });
    setStatusEffects({});
    setStreaks({});
    setWildcard("");
    setWildcardActive(false);
    setRoundTransition(false);
  }, [betPick]);

  useEffect(() => {
    if (!betPlaced) return;
    const timer = setTimeout(() => fetchNext(), 500);
    return () => { clearTimeout(timer); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [betPlaced, fetchNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (doneTyping && (e.key === " " || e.key === "Enter") && !showHeckleInput) { e.preventDefault(); handleContinue(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [doneTyping, handleContinue, showHeckleInput]);

  useEffect(() => {
    if (showVerdict && verdict) {
      const timer = setTimeout(() => {
        navigate(`/summary?topic=${encodeURIComponent(topic)}&winner=${encodeURIComponent(verdict.winner)}&summary=${encodeURIComponent(verdict.summary)}&scores=${encodeURIComponent(JSON.stringify(verdict.scores))}&transcript=${encodeURIComponent(JSON.stringify(fullTranscript))}&bet=${betPoints}&betWon=${betWon}&betPick=${betPick || ""}`);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showVerdict, verdict, fullTranscript, topic, navigate, betPoints, betWon, betPick]);

  const currentAgent = (currentSpeaker === "visionary" || currentSpeaker === "critic" || currentSpeaker === "generalizer")
    ? currentSpeaker as Agent : null;
  const bg = isDark ? "#0D0D14" : "#FAFAFC";

  return (
    <motion.div className="relative w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: bg }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>

      <div className="absolute top-4 right-4 sm:top-5 sm:right-6 z-50 flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
          style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}>
          <Zap size={11} style={{ color: "#F6C453" }} />
          <span className="mono text-[11px] font-semibold" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}>{betPoints}</span>
        </div>
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </div>

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

      {wildcardRevealed && wildcard && (
        <motion.div className="absolute top-32 md:top-36 left-1/2 -translate-x-1/2 z-40"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <div className="rounded-2xl px-6 py-3 border-2 shadow-lg whitespace-nowrap"
            style={{ backgroundColor: isDark ? "rgba(246,196,83,0.1)" : "rgba(246,196,83,0.15)", borderColor: "#F6C453" }}>
            <p className="mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "#F6C453" }}>Wildcard Round!</p>
            <p className="text-sm font-medium" style={{ color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)" }}>{wildcard}</p>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col md:flex-row">
        <motion.div className="hidden md:flex w-[240px] shrink-0 flex-col items-center gap-4 pt-8 px-4 transition-colors duration-500"
          style={{ borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}>
          {agentOrder.map((key) => (
            <div key={key} className="w-full relative">
              <AgentNode name={agentMeta[key].name} icon={agentMeta[key].icon}
                color={agentMeta[key].color} glowColor={agentMeta[key].glow}
                isActive={currentSpeaker === key && (isSpeaking || doneTyping)} isDark={isDark} />
              <div className="mt-1.5 px-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="mono text-[8px] uppercase tracking-wider" style={{ color: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)" }}>
                    Credibility
                  </span>
                  <span className="mono text-[8px] font-semibold" style={{ color: credibility[key] > 60 ? "#57D38C" : credibility[key] > 30 ? "#F6C453" : "#EF4444" }}>
                    {credibility[key]}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                  <motion.div className="h-full rounded-full"
                    style={{
                      background: credibility[key] > 60 ? "#57D38C" : credibility[key] > 30 ? "#F6C453" : "#EF4444",
                    }}
                    animate={{ width: `${credibility[key]}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }} />
                </div>
              </div>
              {statusEffects[key] && (
                <div className="absolute -top-1 -right-1 rounded-full px-2 py-0.5 text-[8px] font-bold mono uppercase tracking-wider"
                  style={{
                    background: statusEffects[key] === "On Fire" ? "#EF4444" : "#8B5CF6",
                    color: "#fff",
                    boxShadow: `0 0 8px ${statusEffects[key] === "On Fire" ? "#EF4444" : "#8B5CF6"}60`,
                  }}>
                  {statusEffects[key]}
                </div>
              )}
            </div>
          ))}
          <motion.div className="mt-4" style={{ opacity: isDark ? 0.7 : 0.6 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}>
            <SharedMemory isPulsing={memoryPulse} compact />
          </motion.div>
        </motion.div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-10 pb-16">
          {phase === "betting" && !betPlaced && (
            <motion.div className="flex flex-col items-center gap-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rounded-2xl p-6 text-center"
                style={{ background: isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.5)", border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"}` }}>
                <Swords size={24} className="mx-auto mb-3" style={{ color: "#F6C453" }} />
                <h2 className="text-lg font-bold mb-2" style={{ color: isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)" }}>
                  Place Your Bet
                </h2>
                <p className="text-sm mb-4" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
                  You have {betPoints} points. Pick who you think will win!
                </p>
                <div className="flex gap-3 justify-center mb-4">
                  {agentOrder.map((key) => (
                    <motion.button key={key} onClick={() => setBetPick(key)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all"
                      style={{
                        background: betPick === key ? agentMeta[key].color : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                        color: betPick === key ? "#fff" : (isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"),
                        border: `1px solid ${betPick === key ? agentMeta[key].color : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)")}`,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      {agentMeta[key].name}
                    </motion.button>
                  ))}
                </div>
                <motion.button onClick={startDebate}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                  style={{
                    background: betPick ? "linear-gradient(135deg, #7C5CFF, #5B8CFF)" : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                    color: betPick ? "#fff" : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"),
                  }}
                  disabled={!betPick}
                  whileHover={betPick ? { scale: 1.04 } : {}}
                  whileTap={betPick ? { scale: 0.97 } : {}}>
                  Start Debate
                </motion.button>
              </div>
            </motion.div>
          )}

          {phase === "intro" && betPlaced && (
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

              {showHeckleInput && doneTyping && (
                <motion.div className="flex items-center gap-2 w-full max-w-[580px]"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <input
                    className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
                      color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)",
                    }}
                    placeholder="Heckle the speaker..."
                    value={heckleText}
                    onChange={(e) => setHeckleText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendHeckle(); }} />
                  <motion.button onClick={sendHeckle}
                    className="rounded-xl px-3 py-2.5 cursor-pointer"
                    style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                    <ThumbsDown size={14} style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }} />
                  </motion.button>
                </motion.div>
              )}

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
          {phase === "verdict" && showVerdict && verdict && (
            <motion.button onClick={fetchRoasts}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 mt-4"
              style={{
                background: "linear-gradient(135deg, #7C5CFF, #5B8CFF)",
                color: "#fff",
              }}
              whileHover={{ scale: 1.04, boxShadow: "0 4px 20px rgba(124,92,255,0.3)" }}
              whileTap={{ scale: 0.97 }}>
              <Swords size={14} />
              <span>Mic Drop Finale</span>
            </motion.button>
          )}
          {phase === "micdrop" && roasts && (
            <motion.div className="w-full max-w-[580px] rounded-2xl p-6 border-2"
              style={{
                background: isDark ? "rgba(18,18,30,0.8)" : "rgba(255,255,255,0.6)",
                borderColor: "#F6C453",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}>
              <h3 className="text-sm font-bold mb-4 text-center" style={{ color: "#F6C453" }}>
                Mic Drop! Roasts
              </h3>
              <div className="space-y-3">
                {roasts.split("\n").filter(Boolean).map((roast, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)" }}>
                    {roast}
                  </p>
                ))}
              </div>
            </motion.div>
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
