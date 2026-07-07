import { createFileRoute } from "@tanstack/react-router";
import { Solver } from "@/components/Solver";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen grid-bg">
      <Solver />
      <footer className="pb-10 text-center text-xs text-muted-foreground">eetirp calci</footer>
    </div>
  );
}
