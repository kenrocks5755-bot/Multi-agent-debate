import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shield, Network, Scale, ChevronDown, Brain } from "lucide-react";

const agentColors: Record<string, string> = {
  visionary: "#7C5CFF",
  critic: "#5B8CFF",
  generalizer: "#57D38C",
  moderator: "#F6C453",
};

const agentIcons: Record<string, typeof Sparkles> = {
  visionary: Sparkles,
  critic: Shield,
  generalizer: Network,
  moderator: Scale,
};

const agentNames: Record<string, string> = {
  visionary: "Visionary",
  critic: "Critic",
  generalizer: "Generalizer",
  moderator: "Moderator",
};

const roundTitles: Record<number, string> = {
  1: "Opening Statements",
  2: "Rebuttals",
  3: "Closing Arguments",
};

interface TranscriptEntry {
  speaker: string;
  round: number;
  message: string;
}

interface DebateTimelineProps {
  transcript: TranscriptEntry[];
  isDark: boolean;
}

function ChatBubble({ entry, isDark, index }: { entry: TranscriptEntry; isDark: boolean; index: number }) {
  const color = agentColors[entry.speaker] || "#6B7280";
  const Icon = agentIcons[entry.speaker] || Brain;
  const name = agentNames[entry.speaker] || entry.speaker;
  const textColor = isDark ? "#FFFFFF" : "rgba(30,30,47,0.75)";
  const mutedColor = isDark ? "rgba(255,255,255,0.75)" : "#6B7280";
  const bgColor = isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.6)";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";

  const lines = entry.message.split("\n").filter(Boolean);
  const isBulleted = lines.some(l => l.trim().startsWith("-") || l.trim().startsWith("*"));

  return (
    <motion.div className="flex gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: "easeInOut" }}>
      <div className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: 28 }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}14` }}>
          <Icon size={12} style={{ color }} />
        </div>
        <div className="w-px flex-1" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} />
      </div>
      <div className="flex-1 min-w-0 pb-7">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold tracking-tight" style={{ color }}>{name}</span>
          <span className="mono text-[9px] uppercase tracking-wider" style={{ color: mutedColor }}>
            Round {entry.round}
          </span>
        </div>
        <motion.div className="p-5 transition-all duration-250"
          style={{ background: bgColor, border: `1px solid ${borderColor}` }}
          whileHover={{ y: -1, boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.2)" : "0 4px 20px rgba(0,0,0,0.04)" }}>
          {isBulleted ? (
            <div className="space-y-3">
              {lines.map((line, i) => {
                const trimmed = line.trim();
                const isBullet = trimmed.startsWith("-") || trimmed.startsWith("*");
                const content = isBullet ? trimmed.replace(/^[-*]\s*/, "") : trimmed;
                return (
                  <div key={i} className="flex items-start gap-3">
                    {isBullet && <div className="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0" style={{ backgroundColor: color, opacity: 0.4 }} />}
                    <span className="text-sm leading-relaxed" style={{ color: textColor }}>{content}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: textColor }}>{entry.message}</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function DebateTimeline({ transcript, isDark }: DebateTimelineProps) {
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>({ 1: true });
  const [allExpanded, setAllExpanded] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<number, TranscriptEntry[]> = {};
    for (const entry of transcript) {
      if (!map[entry.round]) map[entry.round] = [];
      map[entry.round].push(entry);
    }
    return Object.entries(map).sort(([a], [b]) => Number(a) - Number(b));
  }, [transcript]);

  const hasVerdict = transcript.some(e => e.speaker === "moderator");

  const toggleRound = (round: number) => {
    setExpandedRounds(prev => ({ ...prev, [round]: !prev[round] }));
  };

  const toggleAll = () => {
    const newState = !allExpanded;
    setAllExpanded(newState);
    const newRounds: Record<number, boolean> = {};
    for (const [r] of grouped) newRounds[Number(r)] = newState;
    if (hasVerdict) newRounds[4] = newState;
    setExpandedRounds(newRounds);
  };

  const textColor = isDark ? "#FFFFFF" : "#1E1E2F";
  const mutedColor = isDark ? "rgba(255,255,255,0.75)" : "#6B7280";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const bgColor = isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.82)";

  return (
    <motion.div
      style={{ background: bgColor, border: `1px solid ${borderColor}` }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: "easeInOut" }}>
      <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor }}>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold tracking-tight" style={{ color: textColor, fontFamily: "var(--font-heading)" }}>
            Debate Transcript
          </h2>
          <span className="mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-md" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", color: mutedColor }}>
            {transcript.length} messages
          </span>
        </div>
        <motion.button onClick={toggleAll}
          className="mono text-[10px] uppercase tracking-wider cursor-pointer transition-all duration-250"
          style={{ color: "#7C5CFF" }}
          whileHover={{ opacity: 0.7 }}
          whileTap={{ scale: 0.97 }}>
          {allExpanded ? "Collapse All" : "Expand All"}
        </motion.button>
      </div>

      <div className="p-8 space-y-4 overflow-y-auto custom-scrollbar">
        {grouped.map(([round, entries], ri) => {
          const rNum = Number(round);
          const isOpen = expandedRounds[rNum] ?? false;
          const title = roundTitles[rNum] || `Round ${rNum}`;
          return (
            <motion.div key={round} className="overflow-hidden transition-all duration-250"
              style={{ border: `1px solid ${borderColor}` }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: ri * 0.05 }}>
              <motion.button onClick={() => toggleRound(rNum)}
                className="w-full flex items-center justify-between px-8 py-5 cursor-pointer transition-all duration-250"
                style={{ background: isDark ? "rgba(255,255,255,0.01)" : "rgba(255,255,255,0.4)" }}
                whileHover={{ background: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.6)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}>
                    <span className="mono text-[10px] font-semibold" style={{ color: mutedColor }}>{rNum}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-medium tracking-tight" style={{ color: textColor }}>{title}</span>
                    <p className="mono text-[9px] uppercase tracking-wider mt-0.5" style={{ color: mutedColor }}>
                      {entries.length} messages
                    </p>
                  </div>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={14} style={{ color: mutedColor }} />
                </motion.div>
              </motion.button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div className="px-8 pb-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}>
                    <div className="pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                      {entries.map((entry, idx) => (
                        <div key={idx} className="pt-4">
                          <ChatBubble entry={entry} isDark={isDark} index={idx} />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {hasVerdict && (
          <motion.div className="overflow-hidden transition-all duration-250"
            style={{ border: `1px solid ${borderColor}` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: grouped.length * 0.05 }}>
            <motion.button onClick={() => toggleRound(4)}
                className="w-full flex items-center justify-between px-8 py-5 cursor-pointer transition-all duration-250"
                style={{ background: "rgba(246, 196, 83, 0.04)" }}
              whileHover={{ background: "rgba(246, 196, 83, 0.08)" }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(246, 196, 83, 0.1)" }}>
                  <Scale size={12} style={{ color: "#F6C453" }} />
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium tracking-tight" style={{ color: textColor }}>Moderator Verdict</span>
                  <p className="mono text-[9px] uppercase tracking-wider mt-0.5" style={{ color: mutedColor }}>
                    Final evaluation
                  </p>
                </div>
              </div>
              <motion.div animate={{ rotate: expandedRounds[4] ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown size={14} style={{ color: mutedColor }} />
              </motion.div>
            </motion.button>
            <AnimatePresence initial={false}>
              {expandedRounds[4] && (
                <motion.div className="px-8 pb-6"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}>
                  <div className="pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
                    {transcript.filter(e => e.speaker === "moderator").map((entry, idx) => (
                      <div key={idx} className="pt-4">
                        <ChatBubble entry={entry} isDark={isDark} index={idx} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
