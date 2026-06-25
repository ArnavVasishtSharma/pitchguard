import { useState } from "react";

const LEAGUES = [
  { name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", short: "PL", clubsCount: 5, accent: "#7c3aed" },
  { name: "La Liga", flag: "🇪🇸", short: "LL", clubsCount: 4, accent: "#dc2626" },
  { name: "Bundesliga", flag: "🇩🇪", short: "BL", clubsCount: 3, accent: "#d97706" },
  { name: "Serie A", flag: "🇮🇹", short: "SA", clubsCount: 4, accent: "#2563eb" },
  { name: "Ligue 1", flag: "🇫🇷", short: "L1", clubsCount: 3, accent: "#1d4ed8" },
  { name: "Süper Lig", flag: "🇹🇷", short: "SL", clubsCount: 3, accent: "#b45309" },
];

interface LeagueDockProps {
  onSelectLeague: (league: string) => void;
}

export default function LeagueDock({ onSelectLeague }: LeagueDockProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#040a05",
      fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif",
      overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Video background */}
      <video
        autoPlay loop muted playsInline preload="auto"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.4025,
          filter: "brightness(0.7) saturate(0.8)",
        }}
        src="/src/assets/vid1.mp4"
      />

      {/* Dark vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(4,10,5,0.3) 0%, rgba(4,10,5,0.85) 100%)",
      }} />

      {/* Top gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "30%",
        background: "linear-gradient(to bottom, rgba(4,10,5,0.9), transparent)",
        pointerEvents: "none",
      }} />

      {/* Bottom gradient */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: "linear-gradient(to top, rgba(4,10,5,0.9), transparent)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 48, width: "100%", maxWidth: 1100, padding: "0 24px",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", animation: "fadeUp 0.8s ease forwards" }}>
          <p style={{
            fontSize: "0.58rem", letterSpacing: "0.42em", color: "rgba(74,222,128,0.6)",
            textTransform: "uppercase", marginBottom: 16,
            fontFamily: "'Satoshi', sans-serif", fontWeight: 500,
          }}>
            PitchGuard — Injury Risk Intelligence
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.8rem)", fontWeight: 800,
            color: "#e8f5ea", letterSpacing: "-0.025em", lineHeight: 1,
            marginBottom: 16,
          }}>
            Choose Your League
          </h1>
          <div style={{ width: 48, height: 1, background: "rgba(74,222,128,0.4)", margin: "0 auto" }} />
        </div>

        {/* 3x2 Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20, width: "100%",
        }}>
          {LEAGUES.map((league, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={league.name}
                onClick={() => onSelectLeague(league.name)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  position: "relative", cursor: "pointer",
                  borderRadius: 16, overflow: "hidden",
                  transform: isHovered ? "translateY(-6px)" : "translateY(0)",
                  transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  animation: `fadeUp 0.7s ease ${idx * 0.08}s both`,
                  opacity: 0,
                }}
              >
                {/* Card */}
                <div style={{
                  padding: "28px 24px",
                  height: 180,
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  background: isHovered ? "rgba(10,26,18,0.75)" : "rgba(6,18,10,0.55)",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${isHovered ? league.accent + "80" : "rgba(74,222,128,0.12)"}`,
                  borderRadius: 16,
                  boxShadow: isHovered
                    ? `0 20px 48px rgba(0,0,0,0.6), 0 0 24px ${league.accent}18`
                    : "0 4px 24px rgba(0,0,0,0.4)",
                  transition: "all 0.35s ease",
                }}>
                  {/* Top accent line */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "16px 16px 0 0",
                    background: `linear-gradient(90deg, ${league.accent}cc, transparent)`,
                  }} />

                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "3rem", lineHeight: 1 }}>{league.flag}</span>
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em",
                      padding: "4px 10px", borderRadius: 4,
                      background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.4)", fontFamily: "'Satoshi', sans-serif",
                    }}>
                      {league.short}
                    </span>
                  </div>

                  {/* Bottom row */}
                  <div>
                    <h3 style={{
                      fontSize: "1.1rem", fontWeight: 800, color: isHovered ? "#e8f5ea" : "rgba(232,245,234,0.85)",
                      letterSpacing: "-0.01em", marginBottom: 6,
                      transition: "color 0.2s ease",
                    }}>
                      {league.name}
                    </h3>
                    <p style={{
                      fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase",
                      color: "rgba(74,222,128,0.45)", fontFamily: "'Satoshi', sans-serif",
                    }}>
                      {league.clubsCount} clubs tracking
                    </p>
                  </div>

                  {/* Corner brackets on hover */}
                  {isHovered && (
                    <>
                      <div style={{ position: "absolute", top: 10, left: 10, width: 12, height: 12, borderTop: `2px solid ${league.accent}`, borderLeft: `2px solid ${league.accent}`, borderRadius: "2px 0 0 0" }} />
                      <div style={{ position: "absolute", top: 10, right: 10, width: 12, height: 12, borderTop: `2px solid ${league.accent}`, borderRight: `2px solid ${league.accent}`, borderRadius: "0 2px 0 0" }} />
                      <div style={{ position: "absolute", bottom: 10, left: 10, width: 12, height: 12, borderBottom: `2px solid ${league.accent}`, borderLeft: `2px solid ${league.accent}`, borderRadius: "0 0 0 2px" }} />
                      <div style={{ position: "absolute", bottom: 10, right: 10, width: 12, height: 12, borderBottom: `2px solid ${league.accent}`, borderRight: `2px solid ${league.accent}`, borderRadius: "0 0 2px 0" }} />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p style={{
          fontSize: "0.52rem", letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase", fontFamily: "'Satoshi', sans-serif",
          animation: "fadeUp 0.8s ease 0.5s both",
        }}>
          Select a league to begin squad analysis
        </p>
      </div>

      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=bricolage-grotesque@800,700&f[]=satoshi@400,500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}