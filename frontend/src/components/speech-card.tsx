import { motion } from "framer-motion";

interface SpeechCardProps {
  speaker: string;
  message: string;
  color: string;
  round: number;
  isDark: boolean;
}

function MessageContent({ text, color, isDark }: { text: string; color: string; isDark: boolean }) {
  const lines = text.split("\n");
  const isBulleted = lines.some((l) => l.trim().startsWith("-") || l.trim().startsWith("*"));
  const textColor = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)";

  if (!isBulleted) {
    return (
      <p className="leading-[1.8]" style={{ fontSize: 16, color: textColor, maxWidth: 520 }}>
        {text}
      </p>
    );
  }

  return (
    <div className="space-y-3.5" style={{ maxWidth: 520 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        const isBullet = trimmed.startsWith("-") || trimmed.startsWith("*");
        const content = isBullet ? trimmed.replace(/^[-*]\s*/, "") : trimmed;
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full mt-[9px] shrink-0" style={{ backgroundColor: color, opacity: 0.5 }} />
            <span className="leading-[1.8]" style={{ fontSize: 16, color: textColor }}>{content}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SpeechCard({ speaker, message, color, round, isDark }: SpeechCardProps) {
  return (
    <div className="w-full" style={{ maxWidth: 580 }}>
      <div
        className="rounded-2xl p-8 transition-colors duration-500"
        style={{
          backgroundColor: isDark ? "rgba(18,18,30,0.72)" : "rgba(255,255,255,0.5)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"}`,
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="text-sm font-bold tracking-tight" style={{ color }}>{speaker.toUpperCase()}</span>
          <span className="mono text-[11px] uppercase tracking-widest ml-auto transition-colors duration-300 "
            style={{ color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)" }}>
            Round {round}
          </span>
        </div>

        <div className="max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
          <MessageContent text={message} color={color} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
