import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { NumberTicker } from "@/components/ui/NumberTicker";

const SF = "'Inter', 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif";
const MONO = "'Share Tech Mono', 'Courier New', monospace";

type Tier = "Low" | "Medium" | "High";

interface Player {
  id: number;
  name: string;
  position: string;
  riskScore: number;
  tier: Tier;
  nextMatch: { surface: string };
  shapFactors: { label: string; value: number }[];
}

interface IntelFeedProps {
  players: Player[];
}

function CircularGauge({ value, size = 140 }: { value: number; size?: number }) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - 18) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (animated / 100) * circ;
  const cx = size / 2;
  const color = value < 40 ? "#00e87b" : value < 70 ? "#ff9500" : "#ff2d55";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={cx} cy={cx} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
        {/* Gradient arc */}
        <circle
          cx={cx} cy={cx} r={radius} fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34, 1.56, 0.64, 1)", filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}
      >
        <span style={{ fontSize: size * 0.22, fontWeight: 800, color, fontFamily: MONO }}>
          <NumberTicker value={value} suffix="%" duration={1400} />
        </span>
        <span style={{ fontSize: 9, color: "#3a5070", fontFamily: SF, letterSpacing: "0.1em", marginTop: 2 }}>
          SQUAD AVG
        </span>
      </div>
    </div>
  );
}

function SurfaceDonut({ grassPct }: { grassPct: number }) {
  const astroPct = 100 - grassPct;
  const size = 80;
  const r = 30;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const grassDash = (grassPct / 100) * circ;
  const astroDash = (astroPct / 100) * circ;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={10} />
          {/* Astro (orange) */}
          <circle
            cx={cx} cy={cx} r={r} fill="none"
            stroke="#ff9500" strokeWidth={10}
            strokeDasharray={`${animated ? astroDash : 0} ${circ}`}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 1s ease 0.6s" }}
          />
          {/* Grass (green) — starts after astro */}
          <circle
            cx={cx} cy={cx} r={r} fill="none"
            stroke="#00e87b" strokeWidth={10}
            strokeDasharray={`${animated ? grassDash : 0} ${circ}`}
            strokeDashoffset={-astroDash}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray 1s ease 0.8s" }}
          />
        </svg>
        <div
          style={{
            position: "absolute", inset: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: astroPct > 50 ? "#ff9500" : "#00e87b",
            fontFamily: MONO,
          }}
        >
          {astroPct}%
        </div>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff9500", display: "inline-block" }} />
          <span style={{ fontSize: "0.62rem", color: "#ff9500", fontFamily: SF }}>Artificial Turf</span>
          <span style={{ fontSize: "0.62rem", color: "#3a5070", fontFamily: MONO }}>{astroPct}%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00e87b", display: "inline-block" }} />
          <span style={{ fontSize: "0.62rem", color: "#00e87b", fontFamily: SF }}>Natural Grass</span>
          <span style={{ fontSize: "0.62rem", color: "#3a5070", fontFamily: MONO }}>{grassPct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function IntelFeed({ players }: IntelFeedProps) {
  const avg = Math.round(players.reduce((s, p) => s + p.riskScore, 0) / players.length);
  const high = players.filter((p) => p.tier === "High");
  const med = players.filter((p) => p.tier === "Medium");
  const low = players.filter((p) => p.tier === "Low");
  const grassPct = Math.round((players.filter((p) => p.nextMatch.surface === "Natural Grass").length / players.length) * 100);
  const astroPct = 100 - grassPct;
  const topAlerts = [...players].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 8, height: 8, borderRadius: "50%", background: "#00e87b",
            boxShadow: "0 0 8px #00e87b",
            animation: "pulseGreen 2s ease-in-out infinite",
          }}
        />
        <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#00e87b", fontFamily: SF, letterSpacing: "0.14em" }}>
          INTELLIGENCE FEED
        </span>
      </div>

      {/* Squad gauge panel */}
      <GlassPanel corners animationDelay={100}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          <CircularGauge value={avg} size={130} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "High Risk", count: high.length, color: "#ff2d55" },
              { label: "Medium", count: med.length, color: "#ff9500" },
              { label: "Low Risk", count: low.length, color: "#00e87b" },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 4px ${color}` }} />
                <span style={{ fontSize: "0.7rem", color: "#7a9ab8", fontFamily: SF }}>
                  <span style={{ color, fontWeight: 700, fontFamily: MONO }}>{count}</span> {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </GlassPanel>

      {/* Surface Analysis */}
      <GlassPanel animationDelay={200}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#3a5070", fontFamily: SF, letterSpacing: "0.12em" }}>
            UPCOMING SURFACE MIX
          </span>
        </div>
        <SurfaceDonut grassPct={grassPct} />
        {astroPct > 50 && (
          <div
            style={{
              marginTop: 10, padding: "6px 10px", borderRadius: 8,
              background: "rgba(255, 149, 0, 0.1)", border: "1px solid rgba(255, 149, 0, 0.3)",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <span style={{ fontSize: "0.75rem" }}>⚠</span>
            <span style={{ fontSize: "0.6rem", color: "#ff9500", fontFamily: SF }}>
              HIGH ARTIFICIAL SURFACE EXPOSURE
            </span>
          </div>
        )}
      </GlassPanel>

      {/* Alert List */}
      <GlassPanel animationDelay={300}>
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#3a5070", fontFamily: SF, letterSpacing: "0.12em" }}>
            PRIORITY ALERTS
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {topAlerts.map((p, i) => {
            const topFactor = p.shapFactors[0];
            const tierColor = p.tier === "High" ? "#ff2d55" : p.tier === "Medium" ? "#ff9500" : "#00e87b";
            return (
              <div
                key={p.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 10,
                  background: `${tierColor}0a`,
                  border: `1px solid ${tierColor}20`,
                  animation: `playerRowIn 0.5s ease-out ${i * 0.1}s both`,
                }}
              >
                {/* Alert icon */}
                <span style={{ fontSize: "0.9rem", flexShrink: 0 }}>
                  {p.tier === "High" ? "🔴" : p.tier === "Medium" ? "🟠" : "🟢"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#e2e8f0", fontFamily: SF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: "0.58rem", color: "#3a5070", fontFamily: SF, marginTop: 1 }}>
                    {topFactor?.label || "Surface"} · {p.position}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.8rem", fontWeight: 800, color: tierColor,
                    fontFamily: MONO, flexShrink: 0,
                  }}
                >
                  {p.riskScore}%
                </span>
              </div>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
