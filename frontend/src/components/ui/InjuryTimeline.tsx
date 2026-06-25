import { useEffect, useState } from "react";

const INJ_COLORS: Record<string, string> = {
  ACL: "#ff2d55",
  Hamstring: "#ff9500",
  Ankle: "#0a84ff",
  Meniscus: "#bf5af2",
  Knee: "#ff2d55",
  Groin: "#ff9500",
  Back: "#7a9ab8",
};

interface InjuryEvent {
  year: number;
  type: string;
  gamesMissed: number;
}

interface InjuryTimelineProps {
  injuries: InjuryEvent[];
}

export function InjuryTimeline({ injuries }: InjuryTimelineProps) {
  const [visible, setVisible] = useState<boolean[]>([]);

  useEffect(() => {
    setVisible([]);
    injuries.forEach((_, i) => {
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 120 + 100);
    });
  }, [injuries]);

  if (injuries.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 0",
          color: "#3a5070",
          fontSize: "0.75rem",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>✓</span>
        No recorded injuries
      </div>
    );
  }

  return (
    <div style={{ position: "relative", paddingLeft: 24 }}>
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: 7,
          top: 8,
          bottom: 8,
          width: 1.5,
          background:
            "linear-gradient(to bottom, rgba(0,232,123,0.4), rgba(0,232,123,0.05))",
          borderRadius: 4,
        }}
      />

      {injuries.map((inj, i) => {
        const color = INJ_COLORS[inj.type] || "#7a9ab8";
        const isVisible = visible[i];
        return (
          <div
            key={i}
            style={{
              position: "relative",
              paddingBottom: i < injuries.length - 1 ? 16 : 0,
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateX(0)" : "translateX(-8px)",
              transition: "opacity 0.4s ease, transform 0.4s ease",
            }}
          >
            {/* Dot */}
            <div
              style={{
                position: "absolute",
                left: -21,
                top: 4,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 8px ${color}80`,
                border: `2px solid ${color}40`,
                animation: isVisible ? `timelineDot 0.4s ease ${i * 0.12}s both` : undefined,
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: color,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {inj.type}
                  </span>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "#3a5070",
                      fontFamily: "'Share Tech Mono', monospace",
                    }}
                  >
                    {inj.year}
                  </span>
                </div>
                <div style={{ marginTop: 2 }}>
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: "#3a5070",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {inj.gamesMissed} games missed
                  </span>
                </div>
              </div>

              {/* Severity bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {Array.from({ length: 5 }).map((_, bar) => {
                  const threshold = (bar + 1) * 4;
                  return (
                    <div
                      key={bar}
                      style={{
                        width: 4,
                        height: 12 + bar * 2,
                        borderRadius: 2,
                        background:
                          inj.gamesMissed >= threshold
                            ? color
                            : "rgba(255,255,255,0.08)",
                        transition: `background 0.3s ease ${bar * 0.05}s`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
