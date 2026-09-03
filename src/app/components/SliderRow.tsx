import { useCallback, useRef } from "react";

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (v: number) => string;
}

function fmt(v: number, min: number, max: number, format?: (v: number) => string): string {
  if (format) return format(v);
  const range = max - min;
  if (Number.isInteger(v) && range >= 2) return String(v);
  if (range < 0.5) return v.toFixed(3);
  if (range < 5)   return v.toFixed(2);
  return v.toFixed(1);
}

// 5 tick positions: 0%, 25%, 50%, 75%, 100%
const TICK_PCTS = [0, 0.25, 0.5, 0.75, 1];

export function SliderRow({ label, value, min, max, step, onChange, format }: SliderRowProps) {
  const display  = fmt(value, min, max, format);
  const pct      = (value - min) / (max - min);           // 0..1
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  const snap  = (v: number) => {
    if (step <= 0) return clamp(v);
    return clamp(Math.round((v - min) / step) * step + min);
  };

  const posToValue = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return value;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return snap(min + ratio * (max - min));
  }, [min, max, step, value]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    onChange(posToValue(e.clientX));

    const onMove = (ev: MouseEvent) => {
      if (dragging.current) onChange(posToValue(ev.clientX));
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [posToValue, onChange]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    onChange(posToValue(touch.clientX));

    const onMove = (ev: TouchEvent) => onChange(posToValue(ev.touches[0].clientX));
    const onEnd  = () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
  }, [posToValue, onChange]);

  const ticks = TICK_PCTS.map(p => ({
    pct: p,
    label: fmt(min + p * (max - min), min, max, format),
    isNear: Math.abs(p - pct) < 0.13,
  }));

  return (
    <div style={{ marginBottom: 18, userSelect: "none" }}>
      {/* Label row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{
          fontFamily: "DM Mono, monospace", fontSize: 10,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "#888",
        }}>
          {label}
        </span>
        <span style={{
          fontFamily: "DM Mono, monospace", fontSize: 10,
          color: "#C8B400", letterSpacing: "0.05em", minWidth: 48, textAlign: "right",
        }}>
          {display}
        </span>
      </div>

      {/* Track area */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{ position: "relative", width: "100%", cursor: "pointer", paddingBottom: 18 }}
      >
        {/* Track background */}
        <div style={{
          position: "relative", height: 2, background: "#1f1f1f",
          width: "100%", borderRadius: 0,
        }}>
          {/* Filled portion */}
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: `${pct * 100}%`, height: "100%",
            background: "#C8B400", borderRadius: 0,
            pointerEvents: "none",
          }} />
          {/* Thumb */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: `${pct * 100}%`,
            transform: "translate(-50%, -50%)",
            width: 3,
            height: 14,
            background: "#ffffff",
            borderRadius: 1,
            pointerEvents: "none",
          }} />
        </div>

        {/* Tick marks + labels */}
        <div style={{ position: "absolute", top: 6, left: 0, width: "100%" }}>
          {ticks.map((tick, i) => {
            const isFirst = i === 0;
            const isLast  = i === ticks.length - 1;
            const align   = isFirst ? "flex-start" : isLast ? "flex-end" : "center";
            const transform = isFirst ? "none" : isLast ? "translateX(-100%)" : "translateX(-50%)";

            return (
              <div key={i} style={{
                position: "absolute",
                left: isLast ? "100%" : `${tick.pct * 100}%`,
                transform,
                display: "flex",
                flexDirection: "column",
                alignItems: align,
                gap: 2,
                pointerEvents: "none",
              }}>
                {/* Tick line */}
                <div style={{
                  width: 1,
                  height: tick.isNear ? 5 : 3,
                  background: tick.isNear ? "#C8B400" : "#333",
                  transition: "height 0.1s, background 0.1s",
                }} />
                {/* Tick label */}
                <span style={{
                  fontFamily: "DM Mono, monospace",
                  fontSize: 7,
                  lineHeight: 1,
                  color: tick.isNear ? "#C8B400" : "#3a3a3a",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  transition: "color 0.1s",
                }}>
                  {tick.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
