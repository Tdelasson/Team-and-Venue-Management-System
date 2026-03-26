"use client";

interface PitchVisualProps {
  pitchOption: "FULL" | "HALF_A" | "HALF_B";
  size?: "sm" | "md" | "lg";
}

export function PitchVisual({ pitchOption, size = "md" }: PitchVisualProps) {
  const dims = { sm: { w: 120, h: 80 }, md: { w: 200, h: 130 }, lg: { w: 300, h: 195 } };
  const { w, h } = dims[size];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="rounded border border-base-300">
      {/* Full pitch background */}
      <rect x="0" y="0" width={w} height={h} fill="#2d5a27" rx="4" />

      {/* Half A highlight */}
      {(pitchOption === "FULL" || pitchOption === "HALF_A") && (
        <rect x="2" y="2" width={w / 2 - 3} height={h - 4} fill="#4caf50" opacity="0.5" rx="2" />
      )}

      {/* Half B highlight */}
      {(pitchOption === "FULL" || pitchOption === "HALF_B") && (
        <rect x={w / 2 + 1} y="2" width={w / 2 - 3} height={h - 4} fill="#4caf50" opacity="0.5" rx="2" />
      )}

      {/* Center line */}
      <line x1={w / 2} y1="4" x2={w / 2} y2={h - 4} stroke="white" strokeWidth="1.5" strokeDasharray="4,3" />

      {/* Center circle */}
      <circle cx={w / 2} cy={h / 2} r={h / 6} fill="none" stroke="white" strokeWidth="1" opacity="0.5" />

      {/* Labels */}
      <text x={w / 4} y={h / 2 + 4} textAnchor="middle" fill="white" fontSize={size === "sm" ? 9 : 12} fontWeight="bold" opacity="0.8">
        Bane A
      </text>
      <text x={(3 * w) / 4} y={h / 2 + 4} textAnchor="middle" fill="white" fontSize={size === "sm" ? 9 : 12} fontWeight="bold" opacity="0.8">
        Bane B
      </text>
    </svg>
  );
}
