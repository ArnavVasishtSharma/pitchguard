import React from "react";

interface PitchBackgroundProps {
  opacity?: number;
  animate?: boolean;
  className?: string;
}

export function PitchBackground({
  opacity = 0.06,
  animate = true,
  className = "",
}: PitchBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ animation: animate ? "pitchPulse 10s ease-in-out infinite" : undefined }}
    >
      <svg
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full"
        style={{ opacity }}
        fill="none"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="1.5"
      >
        {/* Outer boundary */}
        <rect x="40" y="30" width="720" height="460" rx="2" />

        {/* Halfway line */}
        <line x1="400" y1="30" x2="400" y2="490" />

        {/* Centre circle */}
        <circle cx="400" cy="260" r="70" />
        {/* Centre spot */}
        <circle cx="400" cy="260" r="3" fill="#00e87b" />

        {/* Left penalty box */}
        <rect x="40" y="155" width="132" height="210" />
        {/* Left goal box */}
        <rect x="40" y="205" width="52" height="110" />
        {/* Left penalty spot */}
        <circle cx="128" cy="260" r="3" fill="#00e87b" />
        {/* Left penalty arc */}
        <path d="M 132 210 A 70 70 0 0 1 132 310" />

        {/* Right penalty box */}
        <rect x="628" y="155" width="132" height="210" />
        {/* Right goal box */}
        <rect x="708" y="205" width="52" height="110" />
        {/* Right penalty spot */}
        <circle cx="672" cy="260" r="3" fill="#00e87b" />
        {/* Right penalty arc */}
        <path d="M 668 210 A 70 70 0 0 0 668 310" />

        {/* Corner arcs */}
        <path d="M 40 47 A 18 18 0 0 1 58 30" />
        <path d="M 742 30 A 18 18 0 0 1 760 47" />
        <path d="M 40 473 A 18 18 0 0 0 58 490" />
        <path d="M 742 490 A 18 18 0 0 0 760 473" />

        {/* Goal lines (goals) */}
        <rect x="16" y="218" width="24" height="84" strokeDasharray="4 3" />
        <rect x="760" y="218" width="24" height="84" strokeDasharray="4 3" />

        {/* Subtle goal net pattern — small diamonds behind goals */}
        {Array.from({ length: 7 }).map((_, i) =>
          Array.from({ length: 4 }).map((_, j) => (
            <path
              key={`net-l-${i}-${j}`}
              d={`M ${20 + i * 3} ${220 + j * 18} l 3 9 l 3 -9`}
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))
        )}
        {Array.from({ length: 7 }).map((_, i) =>
          Array.from({ length: 4 }).map((_, j) => (
            <path
              key={`net-r-${i}-${j}`}
              d={`M ${762 + i * 3} ${220 + j * 18} l 3 9 l 3 -9`}
              strokeWidth="0.5"
              opacity="0.4"
            />
          ))
        )}
      </svg>
    </div>
  );
}

/** Goal net hexagonal pattern for use as card texture */
export function GoalNetPattern({ opacity = 0.04 }: { opacity?: number }) {
  const id = React.useId().replace(/:/g, "");
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none rounded-[inherit]"
      style={{ opacity }}
    >
      <defs>
        <pattern
          id={`net-${id}`}
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          {/* Diamond/net crosshatch */}
          <path
            d="M0 10 L10 0 L20 10 L10 20 Z"
            fill="none"
            stroke="#00e87b"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#net-${id})`} />
    </svg>
  );
}

/** Stadium floodlight ray effect */
export function FloodlightRays() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Top-left spotlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "60vw",
          height: "80vh",
          background:
            "conic-gradient(from 100deg at 0% 0%, rgba(255,255,255,0.06) 0deg, transparent 20deg, transparent 340deg, rgba(255,255,255,0.06) 360deg)",
          animation: "spotlightOscillate 12s ease-in-out infinite",
          transformOrigin: "top left",
        }}
      />
      {/* Top-right spotlight */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60vw",
          height: "80vh",
          background:
            "conic-gradient(from 260deg at 100% 0%, rgba(255,255,255,0.06) 0deg, transparent 20deg, transparent 340deg, rgba(255,255,255,0.06) 360deg)",
          animation: "spotlightOscillate 14s ease-in-out infinite reverse",
          transformOrigin: "top right",
        }}
      />
      {/* Central glow — pitch luminescence */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70vw",
          height: "50vh",
          background:
            "radial-gradient(ellipse at center, rgba(0, 232, 123, 0.05) 0%, transparent 70%)",
          animation: "ambientGlow 8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

/** Animated rolling football SVG */
export function RollingFootball({ size = 40 }: { size?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "18%",
        left: 0,
        width: size,
        height: size,
        animation: `footballRoll 8s cubic-bezier(0.4, 0, 0.6, 1) 1.5s infinite`,
        zIndex: 5,
      }}
    >
      <FootballSVG size={size} />
    </div>
  );
}

/** Standalone football SVG (can spin) */
export function FootballSVG({
  size = 24,
  spinning = false,
}: {
  size?: number;
  spinning?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={spinning ? { animation: "footballSpin 2s linear infinite" } : undefined}
    >
      <circle cx="50" cy="50" r="48" fill="#1a1a1a" stroke="#00e87b" strokeWidth="2" />
      {/* Pentagon patches */}
      <polygon
        points="50,20 62,38 55,55 45,55 38,38"
        fill="#00e87b"
        opacity="0.9"
      />
      <polygon
        points="50,80 38,62 45,45 55,45 62,62"
        fill="#00e87b"
        opacity="0.7"
      />
      <polygon
        points="18,42 34,38 42,52 30,64 16,56"
        fill="#00e87b"
        opacity="0.6"
      />
      <polygon
        points="82,42 66,38 58,52 70,64 84,56"
        fill="#00e87b"
        opacity="0.6"
      />
      {/* Seam lines */}
      <line x1="50" y1="20" x2="62" y2="38" stroke="#030d1a" strokeWidth="1.5" />
      <line x1="62" y1="38" x2="55" y2="55" stroke="#030d1a" strokeWidth="1.5" />
      <line x1="55" y1="55" x2="45" y2="55" stroke="#030d1a" strokeWidth="1.5" />
      <line x1="45" y1="55" x2="38" y2="38" stroke="#030d1a" strokeWidth="1.5" />
      <line x1="38" y1="38" x2="50" y2="20" stroke="#030d1a" strokeWidth="1.5" />
    </svg>
  );
}

/** Ghost player silhouettes walking from tunnel */
export function TunnelWalkers({ count = 4 }: { count?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: "14%",
            left: 0,
            animation: `tunnelWalkIn ${9 + i * 1.5}s linear ${i * 2}s infinite`,
            opacity: 0,
          }}
        >
          {/* Simple jersey silhouette */}
          <svg width="32" height="56" viewBox="0 0 32 56" fill="rgba(255,255,255,0.04)">
            <ellipse cx="16" cy="8" rx="7" ry="7" />
            <path d="M6 16 L2 28 L8 28 L8 24 L24 24 L24 28 L30 28 L26 16 Q22 14 16 14 Q10 14 6 16Z" />
            <rect x="8" y="24" width="16" height="20" rx="2" />
            <rect x="8" y="42" width="6" height="14" rx="2" />
            <rect x="18" y="42" width="6" height="14" rx="2" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** A full stadium grass pitch representation with stripes, glows, and white lines */
export function StadiumPitch() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-20">
      {/* Dark green base with vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, #022010 0%, #010c06 100%)"
        }}
      />
      {/* Grass/Lawn mower stripes (Vertical) */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          background: "repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.03) 80px, rgba(255,255,255,0.03) 160px)"
        }}
      />
      {/* Volumetric center spot shadow glow */}
      <div 
        className="absolute inset-x-0 bottom-0 top-1/3 opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(0, 232, 123, 0.1) 0%, transparent 70%)"
        }}
      />
    </div>
  );
}

/** Bank of stadium floodlights with glowing LEDs and volumetric cone rays */
export function StadiumFloodlights() {
  return (
    <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none overflow-hidden z-10 flex justify-between px-6 md:px-20 select-none">
      {/* Left Spotlight Bank */}
      <div className="flex flex-col items-center relative -top-6">
        <div className="flex gap-1.5 bg-neutral-900 border border-neutral-700/50 p-2 rounded-md shadow-2xl relative z-20">
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_rgba(57,255,20,0.8)]" />
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_rgba(57,255,20,0.8)]" />
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_rgba(57,255,20,0.8)]" />
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_rgba(57,255,20,0.8)]" />
        </div>
        {/* Volumetric cone ray */}
        <div
          className="absolute top-4 w-[280px] h-[600px] opacity-15 pointer-events-none"
          style={{
            background: "conic-gradient(from 145deg at 50% 0%, rgba(255,255,255,0.3) 0deg, transparent 40deg, transparent 320deg, rgba(255,255,255,0.3) 360deg)",
            transform: "rotate(12deg)",
            transformOrigin: "top center",
            filter: "blur(12px)",
          }}
        />
      </div>

      {/* Right Spotlight Bank */}
      <div className="flex flex-col items-center relative -top-6">
        <div className="flex gap-1.5 bg-neutral-900 border border-neutral-700/50 p-2 rounded-md shadow-2xl relative z-20">
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_rgba(57,255,20,0.8)]" />
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_rgba(57,255,20,0.8)]" />
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_rgba(57,255,20,0.8)]" />
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_12px_#fff,0_0_24px_rgba(57,255,20,0.8)]" />
        </div>
        {/* Volumetric cone ray */}
        <div
          className="absolute top-4 w-[280px] h-[600px] opacity-15 pointer-events-none"
          style={{
            background: "conic-gradient(from 215deg at 50% 0%, rgba(255,255,255,0.3) 0deg, transparent 40deg, transparent 320deg, rgba(255,255,255,0.3) 360deg)",
            transform: "rotate(-12deg)",
            transformOrigin: "top center",
            filter: "blur(12px)",
          }}
        />
      </div>
    </div>
  );
}
