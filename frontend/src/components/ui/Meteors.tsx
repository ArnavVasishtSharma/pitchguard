
interface MeteorsProps {
  number?: number;
  color?: string;
  minDelay?: number;
  maxDelay?: number;
  minDuration?: number;
  maxDuration?: number;
}

export function Meteors({
  number = 12,
  color = "rgba(0, 232, 123, 0.6)",
  minDelay = 0,
  maxDelay = 8,
  minDuration = 3,
  maxDuration = 8,
}: MeteorsProps) {
  const meteors = Array.from({ length: number }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    width: Math.random() * 80 + 60,
    delay: Math.random() * (maxDelay - minDelay) + minDelay,
    duration: Math.random() * (maxDuration - minDuration) + minDuration,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {meteors.map((m) => (
        <span
          key={m.id}
          style={{
            position: "absolute",
            top: `${m.top}%`,
            left: `${m.left}%`,
            width: m.width,
            height: 1,
            background: `linear-gradient(90deg, ${color}, transparent)`,
            borderRadius: "9999px",
            transform: "rotate(215deg)",
            animation: `meteorFall ${m.duration}s linear ${m.delay}s infinite`,
            opacity: 0,
          }}
        >
          {/* Glow head */}
          <span
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 6px 2px ${color}`,
            }}
          />
        </span>
      ))}
    </div>
  );
}
