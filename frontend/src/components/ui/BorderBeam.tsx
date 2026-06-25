
interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}

export function BorderBeam({
  size = 150,
  duration = 4,
  delay = 0,
  colorFrom = "#00e87b",
  colorTo = "#0a84ff",
  className = "",
}: BorderBeamProps) {
  return (
    <div
      className={`absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 20 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: "transparent",
          border: "1px solid transparent",
          WebkitMask:
            "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* The beam itself */}
      <div
        style={{
          position: "absolute",
          width: size,
          height: size,
          background: `radial-gradient(circle, ${colorFrom}CC 0%, ${colorTo}66 40%, transparent 70%)`,
          borderRadius: "50%",
          top: "50%",
          left: "-25%",
          transform: "translate(-50%, -50%)",
          animation: `beamOrbit ${duration}s linear ${delay}s infinite`,
          filter: `blur(8px)`,
          opacity: 0.8,
        }}
      />
      <style>{`
        @keyframes beamOrbit {
          0% { offset-distance: 0%; top: -${size / 2}px; left: 0; }
          25% { top: 50%; left: calc(100% + ${size / 2}px); }
          50% { top: calc(100% + ${size / 2}px); left: 100%; }
          75% { top: 50%; left: -${size / 2}px; }
          100% { top: -${size / 2}px; left: 0; }
        }
      `}</style>
    </div>
  );
}

/** Simpler beam: a sweeping highlight across a card */
export function CardBeam({
  colorFrom = "#00e87b",
  duration = 3,
  delay = 0,
}: {
  colorFrom?: string;
  duration?: number;
  delay?: number;
}) {
  return (
    <div
      className="absolute inset-0 rounded-[inherit] pointer-events-none overflow-hidden"
      style={{ zIndex: 5 }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "60%",
          background: `linear-gradient(90deg, transparent, ${colorFrom}18, transparent)`,
          animation: `beamSweep ${duration}s ease-in-out ${delay}s infinite`,
        }}
      />
    </div>
  );
}
