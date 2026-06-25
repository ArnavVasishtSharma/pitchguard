import { useEffect, useRef, useState } from "react";

interface NumberTickerProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function NumberTicker({
  value,
  suffix = "",
  prefix = "",
  duration = 1200,
  delay = 0,
  className = "",
  style,
}: NumberTickerProps) {
  const [displayed, setDisplayed] = useState(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number>(0);
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    delayRef.current = setTimeout(() => {
      const animate = (ts: number) => {
        if (startRef.current === null) startRef.current = ts;
        const elapsed = ts - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(eased * value));
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate);
        }
      };
      frameRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
      cancelAnimationFrame(frameRef.current);
    };
  }, [value, duration, delay]);

  return (
    <span className={className} style={style}>
      {prefix}{displayed}{suffix}
    </span>
  );
}
