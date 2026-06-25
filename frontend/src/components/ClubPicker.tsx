import React, { useState, useRef } from "react";

const CLUBS: Record<string, string[]> = {
  "Premier League": ["Arsenal", "Chelsea", "Liverpool", "Manchester City", "Tottenham Hotspur"],
  "La Liga": ["Real Madrid", "Barcelona", "Atletico Madrid", "Sevilla"],
  "Bundesliga": ["Bayern Munich", "Borussia Dortmund", "Bayer Leverkusen"],
  "Serie A": ["Juventus", "AC Milan", "Inter Milan", "AS Roma"],
  "Ligue 1": ["PSG", "Monaco", "Marseille"],
  "Süper Lig": ["Galatasaray", "Fenerbahce", "Besiktas"],
};

const CLUB_SHORT: Record<string, string> = {
  Arsenal: "ARS", Chelsea: "CHE", Liverpool: "LIV", "Manchester City": "MCI", "Tottenham Hotspur": "TOT",
  "Real Madrid": "RMA", Barcelona: "FCB", "Atletico Madrid": "ATM", Sevilla: "SEV",
  "Bayern Munich": "BAY", "Borussia Dortmund": "BVB", "Bayer Leverkusen": "B04",
  Juventus: "JUV", "AC Milan": "ACM", "Inter Milan": "INT", "AS Roma": "ROM",
  PSG: "PSG", Monaco: "MON", Marseille: "MAR",
  Galatasaray: "GAL", Fenerbahce: "FEN", Besiktas: "BES",
};

const CLUB_COLORS: Record<string, string> = {
  Arsenal: "#ef0107", Chelsea: "#034694", Liverpool: "#c8102e", "Manchester City": "#6cabdd", "Tottenham Hotspur": "#132257",
  "Real Madrid": "#d4af37", Barcelona: "#004d98", "Atletico Madrid": "#cb3524", Sevilla: "#d71920",
  "Bayern Munich": "#dc052d", "Borussia Dortmund": "#fde100", "Bayer Leverkusen": "#e32219",
  Juventus: "#e8e8e8", "AC Milan": "#fb090b", "Inter Milan": "#0053a0", "AS Roma": "#861f41",
  PSG: "#004170", Monaco: "#e30613", Marseille: "#00a6e2",
  Galatasaray: "#a90432", Fenerbahce: "#002d72", Besiktas: "#e8e8e8",
};

const CLUB_SURFACE: Record<string, string> = {
  Arsenal: "Natural Grass", Chelsea: "Natural Grass", Liverpool: "Natural Grass",
  "Manchester City": "Natural Grass", "Tottenham Hotspur": "Natural Grass",
  "Real Madrid": "Natural Grass", Barcelona: "Natural Grass", "Atletico Madrid": "Natural Grass", Sevilla: "Natural Grass",
  "Bayern Munich": "Natural Grass", "Borussia Dortmund": "Natural Grass", "Bayer Leverkusen": "Natural Grass",
  Juventus: "Natural Grass", "AC Milan": "Artificial Turf", "Inter Milan": "Natural Grass", "AS Roma": "Artificial Turf",
  PSG: "Natural Grass", Monaco: "Natural Grass", Marseille: "Natural Grass",
  Galatasaray: "Artificial Turf", Fenerbahce: "Natural Grass", Besiktas: "Natural Grass",
};

const CLUB_PLAYERS_COUNT: Record<string, number> = {
  Arsenal: 24, Chelsea: 28, Liverpool: 25, "Manchester City": 23, "Tottenham Hotspur": 26,
  "Real Madrid": 23, Barcelona: 24, "Atletico Madrid": 25, Sevilla: 24,
  "Bayern Munich": 25, "Borussia Dortmund": 26, "Bayer Leverkusen": 24,
  Juventus: 24, "AC Milan": 26, "Inter Milan": 25, "AS Roma": 24,
  PSG: 25, Monaco: 23, Marseille: 24,
  Galatasaray: 26, Fenerbahce: 25, Besiktas: 25,
};

interface ClubPickerProps {
  league: string;
  onSelectClub: (club: string) => void;
  onBack: () => void;
}

export default function ClubPicker({ league, onSelectClub, onBack }: ClubPickerProps) {
  const clubs = CLUBS[league] || [];
  const carouselRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);
  const [tilts, setTilts] = useState<Record<number, { rx: number; ry: number }>>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rx = ((rect.height / 2) - (e.clientY - rect.top)) / 14;
    const ry = ((e.clientX - rect.left) - rect.width / 2) / 14;
    setTilts(prev => ({ ...prev, [idx]: { rx, ry } }));
  };

  const handleMouseLeave = (idx: number) => {
    setTilts(prev => { const c = { ...prev }; delete c[idx]; return c; });
    setHoveredIdx(null);
  };

  const scroll = (dir: "left" | "right") => {
    carouselRef.current?.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  };

  const handleClubClick = (club: string, idx: number) => {
    setClickedIdx(idx);
    setTimeout(() => onSelectClub(club), 400);
  };

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
          objectFit: "cover", opacity: 0.345,
          filter: "brightness(0.6) saturate(0.75)",
        }}
        src="/src/assets/vid2.mp4"
      />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, rgba(4,10,5,0.2) 0%, rgba(4,10,5,0.88) 100%)",
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "35%",
        background: "linear-gradient(to bottom, rgba(4,10,5,0.95), transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "25%",
        background: "linear-gradient(to top, rgba(4,10,5,0.95), transparent)",
        pointerEvents: "none",
      }} />

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: "absolute", top: 28, left: 36, zIndex: 50,
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 16px", borderRadius: 8, cursor: "pointer",
          background: "rgba(0,0,0,0.4)", border: "1px solid rgba(74,222,128,0.2)",
          color: "rgba(232,245,234,0.7)", fontSize: "0.72rem", fontWeight: 600,
          letterSpacing: "0.05em", fontFamily: "'Satoshi', sans-serif",
          transition: "all 0.2s ease",
          backdropFilter: "blur(12px)",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)"; e.currentTarget.style.color = "#e8f5ea"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.2)"; e.currentTarget.style.color = "rgba(232,245,234,0.7)"; }}
      >
        ← Back to Leagues
      </button>

      {/* Wordmark */}
      <div style={{ position: "absolute", top: 28, right: 36, zIndex: 50 }}>
        <span style={{
          fontSize: "0.58rem", letterSpacing: "0.32em", textTransform: "uppercase",
          color: "rgba(74,222,128,0.5)", fontWeight: 700, fontFamily: "'Satoshi', sans-serif",
        }}>
          PitchGuard / {league}
        </span>
      </div>

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 40, width: "100%",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", animation: "fadeUp 0.7s ease forwards" }}>
          <p style={{
            fontSize: "0.58rem", letterSpacing: "0.38em", color: "rgba(74,222,128,0.55)",
            textTransform: "uppercase", marginBottom: 14,
            fontFamily: "'Satoshi', sans-serif",
          }}>
            — {league}
          </p>
          <h1 style={{
            fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 800,
            color: "#e8f5ea", letterSpacing: "-0.025em", lineHeight: 1,
          }}>
            Select Your Club
          </h1>
          <div style={{ width: 40, height: 1, background: "rgba(74,222,128,0.4)", margin: "16px auto 0" }} />
        </div>

        {/* Carousel wrapper */}
        <div style={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
          {/* Left arrow */}
          <button
            onClick={() => scroll("left")}
            style={{
              position: "absolute", left: 24, zIndex: 40,
              width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
              background: "rgba(0,0,0,0.6)", border: "1px solid rgba(74,222,128,0.2)",
              color: "#4ade80", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(12px)", transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)"; e.currentTarget.style.background = "rgba(74,222,128,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.2)"; e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
          >←</button>

          {/* Cards */}
          <div
            ref={carouselRef}
            style={{
              display: "flex", gap: 20, overflowX: "auto", padding: "32px 80px",
              scrollSnapType: "x mandatory", width: "100%",
              scrollbarWidth: "none",
            }}
          >
            {clubs.map((club, idx) => {
              const isClicked = clickedIdx === idx;
              const isHovered = hoveredIdx === idx;
              const tilt = tilts[idx] || { rx: 0, ry: 0 };
              const clubColor = CLUB_COLORS[club] || "#4ade80";
              const isTurf = CLUB_SURFACE[club] === "Artificial Turf";
              const shortName = CLUB_SHORT[club] || club.slice(0, 3).toUpperCase();

              return (
                <div
                  key={club}
                  onClick={() => handleClubClick(club, idx)}
                  onMouseMove={e => { handleMouseMove(e, idx); setHoveredIdx(idx); }}
                  onMouseLeave={() => handleMouseLeave(idx)}
                  style={{
                    flexShrink: 0, width: 210, height: 290,
                    scrollSnapAlign: "center", cursor: "pointer",
                    borderRadius: 16, position: "relative",
                    transform: isClicked
                      ? "scale(1.05)"
                      : `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`,
                    transformStyle: "preserve-3d",
                    transition: isClicked ? "transform 0.3s ease" : "transform 0.15s ease",
                    animation: `fadeUp 0.6s ease ${idx * 0.07}s both`,
                    opacity: 0,
                  }}
                >
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: 16,
                    background: isHovered ? "rgba(8,22,14,0.8)" : "rgba(5,16,9,0.6)",
                    backdropFilter: "blur(20px)",
                    border: `1px solid ${isClicked || isHovered ? clubColor + "60" : "rgba(74,222,128,0.12)"}`,
                    boxShadow: isClicked
                      ? `0 24px 48px rgba(0,0,0,0.8), 0 0 32px ${clubColor}30`
                      : isHovered
                        ? `0 12px 32px rgba(0,0,0,0.6), 0 0 16px ${clubColor}20`
                        : "0 4px 20px rgba(0,0,0,0.4)",
                    display: "flex", flexDirection: "column",
                    justifyContent: "space-between", padding: "24px 20px",
                    overflow: "hidden",
                    transition: "all 0.25s ease",
                  }}>
                    {/* Top accent */}
                    <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 3,
                      background: `linear-gradient(90deg, ${clubColor}, transparent)`,
                      borderRadius: "16px 16px 0 0",
                    }} />

                    {/* Short name */}
                    <div style={{
                      textAlign: "center", marginTop: 12,
                      fontSize: "3.2rem", fontWeight: 800, letterSpacing: "-0.02em",
                      color: clubColor,
                      textShadow: `0 0 20px ${clubColor}30`,
                      lineHeight: 1,
                    }}>
                      {shortName}
                    </div>

                    {/* Club name */}
                    <div style={{ textAlign: "center" }}>
                      <h3 style={{
                        fontSize: "0.95rem", fontWeight: 700, color: "#e8f5ea",
                        lineHeight: 1.3, marginBottom: 12,
                      }}>
                        {club}
                      </h3>

                      {/* Divider */}
                      <div style={{ width: "100%", height: 1, background: "rgba(74,222,128,0.1)", marginBottom: 12 }} />

                      {/* Stats */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                        <span style={{
                          fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase",
                          color: "rgba(232,245,234,0.35)", fontFamily: "'Satoshi', sans-serif",
                        }}>
                          {CLUB_PLAYERS_COUNT[club]} squad players
                        </span>
                        <span style={{
                          fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em",
                          textTransform: "uppercase", padding: "3px 10px", borderRadius: 4,
                          background: isTurf ? "rgba(251,191,36,0.1)" : "rgba(74,222,128,0.1)",
                          border: `1px solid ${isTurf ? "rgba(251,191,36,0.25)" : "rgba(74,222,128,0.25)"}`,
                          color: isTurf ? "#fbbf24" : "#4ade80",
                          fontFamily: "'Satoshi', sans-serif",
                        }}>
                          {isTurf ? "⚠ Artificial Turf" : "✓ Natural Grass"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll("right")}
            style={{
              position: "absolute", right: 24, zIndex: 40,
              width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
              background: "rgba(0,0,0,0.6)", border: "1px solid rgba(74,222,128,0.2)",
              color: "#4ade80", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(12px)", transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.5)"; e.currentTarget.style.background = "rgba(74,222,128,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(74,222,128,0.2)"; e.currentTarget.style.background = "rgba(0,0,0,0.6)"; }}
          >→</button>
        </div>

        {/* Footer */}
        <p style={{
          fontSize: "0.52rem", letterSpacing: "0.3em", color: "rgba(255,255,255,0.18)",
          textTransform: "uppercase", fontFamily: "'Satoshi', sans-serif",
          animation: "fadeUp 0.8s ease 0.4s both",
        }}>
          Select squad for advanced AI prediction analysis
        </p>
      </div>

      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=bricolage-grotesque@800,700&f[]=satoshi@400,500&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}