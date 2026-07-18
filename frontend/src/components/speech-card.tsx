import { Sparkles, Shield, Network } from "lucide-react";

interface SpeechCardProps {
  speaker: string;
  message: string;
  color: string;
  round: number;
  isDark: boolean;
}

const agentIcons: Record<string, typeof Sparkles> = {
  VISIONARY: Sparkles,
  CRITIC: Shield,
  GENERALIZER: Network,
};

function MessageContent({ text, color, isDark }: { text: string; color: string; isDark: boolean }) {
  const lines = text.split("\n");
  const isBulleted = lines.some((l) => l.trim().startsWith("-") || l.trim().startsWith("*"));
  const textColor = isDark ? "#E8E8F0" : "#1A1A2E";

  if (!isBulleted) {
    return (
      <p className="leading-[1.9]" style={{ fontSize: "clamp(15px, 4.5vw, 17px)", color: textColor, maxWidth: 520 }}>
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
            <span className="leading-[1.9]" style={{ fontSize: "clamp(15px, 4.5vw, 17px)", color: textColor }}>{content}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function SpeechCard({ speaker, message, color, round, isDark }: SpeechCardProps) {
  const Icon = agentIcons[speaker.toUpperCase()];
  return (
    <div className="w-full px-2 sm:px-0" style={{ maxWidth: 620 }}>
      <div
        className="rounded-2xl p-5 sm:p-8 transition-colors duration-500"
        style={{
          backgroundColor: isDark ? "rgba(24,24,36,0.92)" : "rgba(255,255,255,0.78)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
          boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          {Icon && (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon size={13} style={{ color }} />
            </div>
          )}
          <span className="text-sm font-bold tracking-tight" style={{ color }}>{speaker.toUpperCase()}</span>
          <span className="mono text-[11px] uppercase tracking-widest ml-auto transition-colors duration-300 "
            style={{ color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
            Round {round}
          </span>
        </div>

        <div className="pr-1">
          <MessageContent text={message} color={color} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
