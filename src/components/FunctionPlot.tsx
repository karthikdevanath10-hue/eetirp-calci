import { useEffect, useRef } from "react";
import type { Plot } from "@/lib/solver.functions";

export function FunctionPlot({ plot }: { plot: Plot }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    (async () => {
      const { default: functionPlot } = await import("function-plot");
      if (cancelled || !ref.current) return;
      ref.current.innerHTML = "";
      try {
        functionPlot({
          target: ref.current,
          width: ref.current.clientWidth || 640,
          height: 320,
          grid: true,
          xAxis: { domain: [plot.xMin, plot.xMax], label: plot.xLabel ?? "x" },
          yAxis: { label: plot.yLabel ?? "y" },
          data: [{ fn: plot.expression, color: "#22d3ee" }],
        });
      } catch (e) {
        if (ref.current)
          ref.current.innerHTML = `<div style="color:#f87171;font-size:12px;padding:1rem">Plot error: ${String(e).slice(0, 200)}</div>`;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [plot]);

  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h4 className="text-sm font-medium text-foreground">{plot.title}</h4>
        <code className="mono-num text-xs text-muted-foreground">y = {plot.expression}</code>
      </div>
      <div ref={ref} className="[&_svg]:!bg-transparent" />
    </div>
  );
}
