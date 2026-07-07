import type { CircuitDiagram } from "@/lib/solver.functions";

const CELL = 60;
const PAD = 40;

function nodeXY(n: { x: number; y: number }) {
  return { cx: PAD + n.x * CELL, cy: PAD + n.y * CELL };
}

function ElementGlyph({
  type,
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  type: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const horiz = Math.abs(x2 - x1) > Math.abs(y2 - y1);
  const stroke = "#67e8f9";

  if (type === "WIRE") {
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={2} />;
  }
  if (type === "GND") {
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={2} />
        <line x1={x2 - 10} y1={y2} x2={x2 + 10} y2={y2} stroke={stroke} strokeWidth={2} />
        <line x1={x2 - 6} y1={y2 + 4} x2={x2 + 6} y2={y2 + 4} stroke={stroke} strokeWidth={2} />
        <line x1={x2 - 3} y1={y2 + 8} x2={x2 + 3} y2={y2 + 8} stroke={stroke} strokeWidth={2} />
      </g>
    );
  }
  // Draw approach lines then glyph in middle
  const glyphSize = 22;
  const gx1 = horiz ? mx - glyphSize : mx;
  const gx2 = horiz ? mx + glyphSize : mx;
  const gy1 = horiz ? my : my - glyphSize;
  const gy2 = horiz ? my : my + glyphSize;
  return (
    <g>
      <line x1={x1} y1={y1} x2={gx1} y2={gy1} stroke={stroke} strokeWidth={2} />
      <line x1={gx2} y1={gy2} x2={x2} y2={y2} stroke={stroke} strokeWidth={2} />
      {type === "R" && (
        <g transform={`translate(${mx}, ${my}) rotate(${horiz ? 0 : 90})`}>
          <rect
            x={-glyphSize}
            y={-8}
            width={glyphSize * 2}
            height={16}
            fill="#0e1a24"
            stroke={stroke}
            strokeWidth={2}
            rx={2}
          />
        </g>
      )}
      {type === "C" && (
        <g transform={`translate(${mx}, ${my}) rotate(${horiz ? 0 : 90})`}>
          <line x1={-4} y1={-14} x2={-4} y2={14} stroke={stroke} strokeWidth={2.5} />
          <line x1={4} y1={-14} x2={4} y2={14} stroke={stroke} strokeWidth={2.5} />
        </g>
      )}
      {type === "L" && (
        <g transform={`translate(${mx}, ${my}) rotate(${horiz ? 0 : 90})`}>
          {[-15, -5, 5, 15].map((cx) => (
            <circle key={cx} cx={cx} cy={0} r={6} fill="none" stroke={stroke} strokeWidth={2} />
          ))}
        </g>
      )}
      {type === "V" && (
        <g transform={`translate(${mx}, ${my})`}>
          <circle r={16} fill="#0e1a24" stroke={stroke} strokeWidth={2} />
          <text y={-2} textAnchor="middle" fontSize={12} fill={stroke}>
            +
          </text>
          <text y={12} textAnchor="middle" fontSize={12} fill={stroke}>
            −
          </text>
        </g>
      )}
      {type === "I" && (
        <g transform={`translate(${mx}, ${my})`}>
          <circle r={16} fill="#0e1a24" stroke={stroke} strokeWidth={2} />
          <text y={5} textAnchor="middle" fontSize={14} fill={stroke}>
            ↑
          </text>
        </g>
      )}
      {type === "D" && (
        <g transform={`translate(${mx}, ${my}) rotate(${horiz ? 0 : 90})`}>
          <polygon points={`-10,-10 -10,10 10,0`} fill={stroke} />
          <line x1={10} y1={-10} x2={10} y2={10} stroke={stroke} strokeWidth={2} />
        </g>
      )}
      <text
        x={horiz ? mx : mx + 22}
        y={horiz ? my - 22 : my + 4}
        textAnchor={horiz ? "middle" : "start"}
        fontSize={11}
        fill="#a5f3fc"
        className="mono-num"
      >
        {label}
      </text>
    </g>
  );
}

export function CircuitDiagramView({ diagram }: { diagram: CircuitDiagram }) {
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));
  const maxX = Math.max(...diagram.nodes.map((n) => n.x), 5);
  const maxY = Math.max(...diagram.nodes.map((n) => n.y), 3);
  const w = PAD * 2 + maxX * CELL;
  const h = PAD * 2 + maxY * CELL;

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <h4 className="mb-2 text-sm font-medium">Circuit</h4>
      <div className="overflow-auto">
        <svg
          width={w}
          height={h}
          className="rounded-md"
          style={{ background: "oklch(0.14 0.02 240)" }}
        >
          <defs>
            <pattern id="dotgrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="oklch(0.82 0.16 200 / 0.12)" />
            </pattern>
          </defs>
          <rect width={w} height={h} fill="url(#dotgrid)" />
          {diagram.elements.map((el, i) => {
            const from = nodeMap.get(el.from);
            const to = nodeMap.get(el.to);
            if (!from || !to) return null;
            const { cx: x1, cy: y1 } = nodeXY(from);
            const { cx: x2, cy: y2 } = nodeXY(to);
            return (
              <ElementGlyph
                key={i}
                type={el.type}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                label={el.value ? `${el.label} ${el.value}` : el.label}
              />
            );
          })}
          {diagram.nodes.map((n) => {
            const { cx, cy } = nodeXY(n);
            return <circle key={n.id} cx={cx} cy={cy} r={3} fill="#67e8f9" />;
          })}
        </svg>
      </div>
    </div>
  );
}
