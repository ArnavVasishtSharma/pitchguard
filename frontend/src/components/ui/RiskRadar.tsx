import { useEffect, useState } from "react";

interface RiskRadarProps {
  values: {
    surface: number;    // 0–100
    workload: number;
    history: number;
    age: number;
    position: number;
    recovery: number;
  };
  size?: number;
  animationDelay?: number;
}

const AXES = [
  { key: "surface", label: "Surface" },
  { key: "workload", label: "Workload" },
  { key: "history", label: "History" },
  { key: "age", label: "Age" },
  { key: "position", label: "Position" },
  { key: "recovery", label: "Recovery" },
] as const;

function polarToXY(angle: number, radius: number, cx: number, cy: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export function RiskRadar({
  values,
  size = 200,
  animationDelay = 0,
}: RiskRadarProps) {
  const [animated, setAnimated] = useState(false);
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const levels = [0.25, 0.5, 0.75, 1.0];
  const n = AXES.length;
  const angleStep = 360 / n;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), animationDelay + 200);
    return () => clearTimeout(t);
  }, [animationDelay]);

  const vals = AXES.map((a) => values[a.key] / 100);
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;

  const getColor = () => {
    if (avg > 0.65) return "#ff2d55";
    if (avg > 0.4) return "#ff9500";
    return "#00e87b";
  };
  const color = getColor();

  // Build polygon points for data
  const dataPoints = AXES.map((_, i) => {
    const angle = i * angleStep;
    const r = (animated ? vals[i] : 0) * maxR;
    return polarToXY(angle, r, cx, cy);
  });

  // Build polygon points for each grid level
  const gridPolygons = levels.map((level) =>
    AXES.map((_, i) => {
      const angle = i * angleStep;
      return polarToXY(angle, level * maxR, cx, cy);
    })
  );

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  return (
    <div
      style={{
        width: size,
        height: size,
        animation: animated ? undefined : `radarDraw 0.8s ease-out ${animationDelay}ms both`,
      }}
    >
      <svg width={size} height={size}>
        {/* Grid polygons */}
        {gridPolygons.map((pts, i) => (
          <path
            key={i}
            d={toPath(pts)}
            fill="none"
            stroke="rgba(0, 232, 123, 0.15)"
            strokeWidth={0.8}
          />
        ))}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const angle = i * angleStep;
          const end = polarToXY(angle, maxR, cx, cy);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke="rgba(0, 232, 123, 0.12)"
              strokeWidth={0.8}
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={toPath(dataPoints)}
          fill={`${color}22`}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
          style={{ transition: "all 1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        />

        {/* Data dots */}
        {dataPoints.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={3}
            fill={color}
            style={{
              filter: `drop-shadow(0 0 4px ${color})`,
              transition: "all 1s ease",
            }}
          />
        ))}

        {/* Axis labels */}
        {AXES.map((axis, i) => {
          const angle = i * angleStep;
          const labelR = maxR + 18;
          const pos = polarToXY(angle, labelR, cx, cy);
          return (
            <text
              key={axis.key}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(122, 154, 184, 0.9)"
              fontSize={9}
              fontFamily="'Inter', sans-serif"
              fontWeight={600}
              style={{ letterSpacing: "0.05em" }}
            >
              {axis.label.toUpperCase()}
            </text>
          );
        })}

        {/* Center label */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={14}
          fontFamily="'Share Tech Mono', monospace"
          fontWeight={700}
        >
          {Math.round(avg * 100)}
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(122, 154, 184, 0.6)"
          fontSize={7}
          fontFamily="'Inter', sans-serif"
        >
          AVG RISK
        </text>
      </svg>
    </div>
  );
}
