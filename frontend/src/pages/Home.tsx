import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/theme-context";
import TopicInput from "../components/topic-input";
import LiveStatus from "../components/live-status";
import ThemeToggle from "../components/theme-toggle";
import { Sparkles, Shield, Network, FileText, ExternalLink } from "lucide-react";

let wordIndex = 0;
function nextWordDelay() { wordIndex++; return 0.15 + wordIndex * 0.1; }

const heroWords = [
  { text: "Three", delay: 0.15 },
  { text: "AI", delay: 0.25, accent: true },
  { text: "Minds.", delay: 0.35 },
];

const features = [
  { icon: Sparkles, label: "3 AI Agents", color: "#7C5CFF" },
  { icon: Shield, label: "Real-time Debate", color: "#5B8CFF" },
  { icon: Network, label: "Structured Arguments", color: "#57D38C" },
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const { isDark, toggleTheme } = useTheme();

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setTopic("");
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const bg = isDark ? "#0D0D14" : "#FAFAFC";
  const textColor = isDark ? "rgba(255,255,255,0.8)" : "#1E1E2F";
  const mutedColor = isDark ? "rgba(255,255,255,0.2)" : "#6B7280";
  const borderColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const textShadow = isDark ? "0 1px 4px rgba(0,0,0,0.6)" : "0 1px 3px rgba(0,0,0,0.1)";
  const heroGlow = isDark ? "0 0 20px rgba(124,92,255,0.15)" : "0 0 15px rgba(124,92,255,0.05)";

  return (
    <div className="relative w-full h-full flex flex-col items-center overflow-hidden select-none transition-colors duration-700"
      style={{ backgroundColor: bg }}>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <img src="/bg.jpeg" alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: isDark ? "brightness(0.35) saturate(1.2)" : "brightness(0.85) saturate(0.9)" }} />
        <div className="absolute inset-0" style={{
          background: isDark
            ? "linear-gradient(180deg, rgba(13,13,20,0.2) 0%, rgba(13,13,20,0.4) 50%, rgba(13,13,20,0.75) 100%)"
            : "linear-gradient(180deg, rgba(250,250,252,0.12) 0%, rgba(250,250,252,0.25) 50%, rgba(250,250,252,0.6) 100%)"
        }} />
      </div>

      <div className="w-full flex items-center justify-between px-8 py-5 relative z-10" style={{ paddingLeft: 32, paddingRight: 32 }}>
        <motion.div className="flex items-center gap-2"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          <Sparkles size={16} style={{ color: "#7C5CFF" }} />
          <span className="text-sm font-semibold tracking-tight" style={{ color: textColor, fontFamily: "var(--font-heading)" }}>
            Debate Arena
          </span>
        </motion.div>
        <motion.div className="flex items-center gap-4"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
          {[{ icon: FileText, label: "Docs" }, { icon: ExternalLink, label: "GitHub" }].map((item) => (
            <motion.a key={item.label} href="#" onClick={(e) => e.preventDefault()}
              className="flex items-center gap-1.5 mono text-[11px] uppercase tracking-wider cursor-pointer transition-all duration-300"
              style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(30,30,47,0.45)", textShadow }}
              whileHover={{ color: textColor }}
              whileTap={{ scale: 0.97 }}>
              <item.icon size={12} />
              {item.label}
            </motion.a>
          ))}
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10" style={{ marginTop: -60 }}>
        <motion.div className="flex items-center gap-2 mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#7C5CFF" }} />
          <span className="mono text-[10px] uppercase tracking-[0.2em]" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(30,30,47,0.5)", textShadow }}>
            Multi-Agent Debate Platform
          </span>
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#57D38C" }} />
        </motion.div>

        <div className="text-center mb-5">
          <h1 className="font-black tracking-tight leading-[1.05] transition-colors duration-500"
            style={{
              fontSize: "clamp(44px, 8vw, 80px)",
              color: isDark ? "#fff" : "#1E1E2F",
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.05em",
              textShadow: heroGlow,
            }}>
            {heroWords.map((word) => (
              <motion.span key={word.text} className="inline-block mr-[0.15em]"
                initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.6, delay: word.delay, ease: [0.16, 1, 0.3, 1] }}
                style={word.accent ? { background: "linear-gradient(135deg, #7C5CFF, #5B8CFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } : {}}>
                {word.text}{" "}
              </motion.span>
            ))}
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
            <span className="font-black tracking-tight leading-[1.05] transition-colors duration-500"
              style={{
                fontSize: "clamp(44px, 8vw, 80px)",
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.05em",
                background: "linear-gradient(135deg, #7C5CFF, #57D38C, #F6C453)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 0 15px rgba(124,92,255,0.1))",
              }}>
              One Verdict.
            </span>
          </motion.div>
        </div>

        <motion.div className="w-24 h-px mb-3"
          style={{ background: "linear-gradient(90deg, transparent, rgba(124,92,255,0.3), transparent)", transformOrigin: "center" }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }} />

        <motion.p
          className="text-[15px] sm:text-[17px] text-center max-w-lg leading-relaxed mb-8 transition-colors duration-500"
          style={{ color: isDark ? "rgba(255,255,255,0.55)" : "rgba(30,30,47,0.6)", textShadow }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}>
          Enter any question and watch autonomous AI agents challenge,
          <br />critique, synthesize, and judge the strongest argument.
        </motion.p>

        <motion.div className="flex items-center gap-3 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.95 }}>
          {features.map((f, i) => (
            <motion.div key={f.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: isDark ? `${f.color}08` : `${f.color}06`, border: `1px solid ${isDark ? `${f.color}12` : `${f.color}10`}` }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.95 + i * 0.08 }}>
              <f.icon size={11} style={{ color: f.color }} />
              <span className="mono text-[9px] uppercase tracking-wider" style={{ color: f.color, textShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>{f.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <TopicInput value={topic} onChange={setTopic} />

        <motion.div className="mt-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.4 }}>
          <LiveStatus />
        </motion.div>
      </div>

      <motion.div className="w-full flex items-center justify-center py-5 relative z-10 gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}>
        {["LangGraph", "OpenCode", "Vite", "React", "FastAPI"].map((tech, i) => (
          <span key={tech}
            className="mono text-[9px] uppercase tracking-[0.15em] transition-colors duration-300"
            style={{ color: isDark ? `rgba(255,255,255,${0.2 + i * 0.04})` : `rgba(30,30,47,${0.2 + i * 0.04})`, textShadow }}>
            {tech}{i < 4 ? <span style={{ color: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)", marginLeft: 12 }}>·</span> : null}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
