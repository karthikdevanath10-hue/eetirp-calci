import type { FBDDiagram } from "@/lib/solver.functions";

export function FreeBodyDiagramView({ diagram }: { diagram: FBDDiagram }) {
  const size = 320;
  const cx = size / 2;
  const cy = size / 2;
  const arrowLen = 90;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <h4 className="mb-2 text-sm font-medium">Free-body diagram — {diagram.body}</h4>
      <svg
        width={size}
        height={size}
        className="mx-auto rounded-md"
        style={{ background: "oklch(0.14 0.02 240)" }}
      >
        <rect
          x={cx - 22}
          y={cy - 22}
          width={44}
          height={44}
          fill="#0e1a24"
          stroke="#67e8f9"
          strokeWidth={2}
          rx={4}
        />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fill="#a5f3fc">
          {diagram.body}
        </text>
        {diagram.forces.map((f, i) => {
          const rad = (f.angleDeg * Math.PI) / 180;
          const ex = cx + Math.cos(rad) * arrowLen;
          const ey = cy - Math.sin(rad) * arrowLen;
          const label = f.magnitude ? `${f.label} = ${f.magnitude}` : f.label;
          return (
            <g key={i}>
              <defs>
                <marker
                  id={`arr${i}`}
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#22d3ee" />
                </marker>
              </defs>
              <line
                x1={cx}
                y1={cy}
                x2={ex}
                y2={ey}
                stroke="#22d3ee"
                strokeWidth={2.5}
                markerEnd={`url(#arr${i})`}
              />
              <text
                x={ex + Math.cos(rad) * 14}
                y={ey - Math.sin(rad) * 14}
                textAnchor="middle"
                fontSize={12}
                fill="#a5f3fc"
                className="mono-num"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
