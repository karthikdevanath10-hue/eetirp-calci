import { useEffect, useRef, useState } from "react";
import { parseAndSolve } from "@/lib/nlp-router";
import { type Solution } from "@/lib/programmatic-solvers";
import { Latex } from "./Latex";

const SUBJECTS = ["Maths", "Physics", "Electronics", "Electrical", "Mechanical", "Civil"];

interface Template {
  name: string;
  query: string;
  description: string;
}

const TEMPLATES: Record<string, Template[]> = {
  Maths: [
    {
      name: "Linear Equation",
      query: "ax + b = c",
      description: "Solves standard ax + b = c equations.",
    },
    {
      name: "Quadratic Equation",
      query: "ax^2 + bx + c = 0",
      description: "Calculates real and complex roots, discriminant, and vertex coordinates.",
    },
    {
      name: "System of 2 Equations",
      query: "a1x + b1y = c1 and a2x + b2y = c2",
      description: "Solves two linear equations using Cramer's determinant rule.",
    },
    {
      name: "Matrix 2x2 Determinant",
      query: "matrix determinant: [[a, b], [c, d]]",
      description: "Calculates the determinant of a 2x2 matrix step-by-step.",
    },
    {
      name: "Vector Cross Product",
      query: "vector cross product: u = [u1, u2, u3], v = [v1, v2, v3]",
      description: "Computes the 3D cross product vector components.",
    },
  ],
  Physics: [
    {
      name: "Projectile Motion",
      query: "projectile motion: velocity = v, angle = theta",
      description: "Solves flight time, horizontal range, and peak height.",
    },
    {
      name: "Kinematics (SUVAT)",
      query: "kinematics: initial velocity = u, acceleration = a, time = t",
      description: "Calculates displacement, final velocity, and time variables.",
    },
    {
      name: "Dynamics: Force & Friction",
      query: "friction force: mass = m, acceleration = a, friction coefficient = mu",
      description: "Calculates normal force, friction, and total driving force Fn, Ff, F.",
    },
    {
      name: "Centripetal Force",
      query: "centripetal force: mass = m, velocity = v, radius = r",
      description: "Calculates centripetal acceleration and inward force Fc.",
    },
  ],
  Electronics: [
    {
      name: "Ohm's Law",
      query: "ohm's law: current = i, resistance = r",
      description: "Solves for the missing parameter (V, I, or R) given any two inputs.",
    },
    {
      name: "Resistor Network",
      query: "parallel resistors: r1, r2, r3",
      description: "Calculates the total equivalent resistance for series or parallel connections.",
    },
    {
      name: "Voltage Divider Circuit",
      query: "voltage divider: input voltage = vin, resistor 1 = r1, resistor 2 = r2",
      description: "Calculates output voltage across R2 in series divider networks.",
    },
  ],
  Electrical: [
    {
      name: "RLC AC Impedance",
      query: "RLC circuit: resistance = r, inductance = l, capacitance = c, frequency = f",
      description: "Computes inductive/capacitive reactances, total impedance, and phase angle.",
    },
    {
      name: "Transformer Turns Ratio",
      query: "transformer: primary voltage = vp, primary turns = np, secondary turns = ns",
      description: "Calculates turns step factor and secondary output voltage Vs.",
    },
  ],
  Mechanical: [
    {
      name: "Beam Bending",
      query: "beam: length = l, load = p",
      description: "Solves support reactions, max bending moment, and maximum shear force.",
    },
    {
      name: "Heat Conduction",
      query:
        "heat conduction: conductivity = k, area = a, thickness = d, inside = t1, outside = t2",
      description: "Calculates steady-state 1D heat flow rate through a material boundary.",
    },
    {
      name: "Hydrostatic Fluid Pressure",
      query: "fluid pressure: density = rho, height = h",
      description: "Calculates hydrostatic pressure at depth h in Pascals and kPa.",
    },
    {
      name: "Gear Speed Ratio",
      query: "gear speed: driver teeth = t1, driven teeth = t2, driver speed = n1",
      description: "Calculates gear transmission ratio and driven output speed N2.",
    },
  ],
  Civil: [
    {
      name: "Active Earth Pressure",
      query: "earth pressure: wall height = h, weight = gamma, friction = phi",
      description:
        "Solves Rankine's lateral soil thrust pressure coefficient and resultant forces.",
    },
    {
      name: "Concrete spec Compressive Strength",
      query: "concrete strength: load = p, diameter = d",
      description:
        "Calculates cross-sectional area and compressive strength of specimen cylinders.",
    },
    {
      name: "Euler Column Buckling",
      query: "column buckling: elastic modulus = e, moment of inertia = i, length = l, factor = k",
      description: "Calculates effective column length and critical buckling load Pcr.",
    },
  ],
};

export function Solver() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeSubject, setActiveSubject] = useState("Maths");
  const [prompt, setPrompt] = useState("");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Initialize theme from localStorage/media preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        setTheme("dark");
        document.documentElement.classList.add("dark");
      } else {
        setTheme("light");
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Web Speech API Voice Input setup
  /* eslint-disable @typescript-eslint/no-explicit-any */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onresult = (e: any) => {
          const resultText = e.results[0][0].transcript;
          setPrompt((p) => (p ? `${p} ${resultText}` : resultText));
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error", e);
          setError("Speech recognition failed or timed out.");
          setRecording(false);
        };

        rec.onend = () => {
          setRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  function handleCalculate(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    setSolution(null);
    setLoading(true);

    // Dynamic timeout to simulate resolving
    setTimeout(() => {
      try {
        const sol = parseAndSolve(activeSubject, prompt);
        if (sol) {
          setSolution(sol);
        } else {
          setError(
            `Question format not recognized. Please review and type using one of the templates listed below for ${activeSubject}.`,
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Calculation failed.");
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function handleFileUpload(f: File | null) {
    if (!f) return;
    setError(null);
    setAttachedFileName(f.name);

    if (f.type.startsWith("text/") || f.name.endsWith(".txt") || f.name.endsWith(".csv")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setPrompt((p) => (p ? `${p}\n\n${text}` : text));
      };
      reader.readAsText(f);
    } else {
      setError(
        "Text files (.txt, .csv) are loaded directly into the text area. For images, write the equations manually.",
      );
    }
  }

  function startRecording() {
    setError(null);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setRecording(true);
      } catch (err) {
        setError("Speech recognition already running or blocked.");
      }
    } else {
      setError(
        "Web Speech API is not supported in this browser. Try Google Chrome or Microsoft Edge.",
      );
    }
  }

  function stopRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="mono-num text-xs uppercase tracking-[0.3em] text-primary">
            ⏚ eetirp calci v2
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Instant Offline Engineering Calculator
          </h1>
        </div>
        <button
          onClick={toggleTheme}
          type="button"
          className="rounded-full border border-border p-2.5 text-sm text-foreground hover:bg-accent transition"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </header>

      {/* Subject Navigation Tabs */}
      <div className="mb-6 flex gap-2 border-b border-border pb-px overflow-x-auto whitespace-nowrap">
        {SUBJECTS.map((sub) => (
          <button
            key={sub}
            onClick={() => {
              setActiveSubject(sub);
              setSolution(null);
              setError(null);
            }}
            className={`px-5 py-2.5 text-sm font-semibold capitalize border-b-2 transition ${
              activeSubject === sub
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Inputs Form */}
      <div className="rounded-2xl border border-border bg-card/70 p-5 shadow-lg backdrop-blur space-y-4">
        <form onSubmit={handleCalculate} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Type your ${activeSubject} question (or select a template below)...`}
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-input/40 p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />

          {/* Template Dropdown Selector */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="template-select"
              className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1"
            >
              Select a {activeSubject} question template:
            </label>
            <select
              id="template-select"
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  setPrompt(val);
                  setError(null);
                  setSolution(null);
                }
              }}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer dark:bg-[#131b2e]"
            >
              <option value="" disabled className="bg-card text-foreground dark:bg-[#131b2e]">
                -- Choose a template to auto-fill --
              </option>
              {TEMPLATES[activeSubject]?.map((t, idx) => (
                <option
                  key={idx}
                  value={t.query}
                  className="bg-card text-foreground dark:bg-[#131b2e]"
                >
                  {t.name} ({t.query})
                </option>
              ))}
            </select>
          </div>

          {attachedFileName && (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-input/30 p-2.5">
              <div className="h-10 w-10 rounded bg-accent flex items-center justify-center text-xl">
                📄
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground truncate max-w-[250px]">
                  {attachedFileName}
                </span>
                <span className="text-[10px] text-muted-foreground">Text loaded into prompt</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFileName(null)}
                className="ml-auto text-xs text-destructive hover:underline font-semibold"
              >
                Clear
              </button>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <label className="cursor-pointer rounded-lg border border-border px-3.5 py-2.5 text-xs font-semibold hover:bg-accent transition select-none">
              📁 Load file
              <input
                type="file"
                accept="text/*,.txt,.csv"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files?.[0] ?? null)}
              />
            </label>
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className={`rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition ${
                recording
                  ? "border-destructive bg-destructive/20 text-destructive animate-pulse"
                  : "border-border hover:bg-accent"
              }`}
            >
              {recording ? "⏹ Stop Dictating" : "🎙 Dictate Question"}
            </button>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="ml-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:brightness-115 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Calculating..." : "Solve Question →"}
            </button>
          </div>
        </form>
      </div>

      {/* Solutions / Loading / Errors Section (Vertical Stack) */}
      <div className="mt-8 space-y-6">
        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive font-medium leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center gap-3.5 rounded-xl border border-border bg-card/60 p-5 shadow-sm">
            <div className="h-3.5 w-3.5 animate-pulse rounded-full bg-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              Resolving equations locally...
            </span>
          </div>
        )}

        {/* Output Solution Viewer */}
        {solution && !loading && (
          <article className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="mono-num rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-widest text-primary">
                {solution.domain}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoBlock title="Given" items={solution.given} />
              <InfoBlock title="Find" items={solution.find} />
              <InfoBlock title="Assumptions" items={solution.assumptions} />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground/80 pl-1 uppercase tracking-wider text-[11px]">
                Worked Solution Steps
              </h3>
              <ol className="space-y-3">
                {solution.steps.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm relative overflow-hidden"
                    style={{ borderLeft: "4px solid var(--color-primary)" }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="mono-num text-[11px] font-bold text-primary">
                        STEP {i + 1}
                      </span>
                      <h4 className="font-semibold text-sm text-foreground">{s.title}</h4>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {s.explanation}
                    </p>
                    {s.latex && (
                      <div className="mt-3 overflow-x-auto rounded-lg bg-background/50 p-3.5 border border-border/60">
                        <Latex tex={s.latex} block />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-primary/40 bg-primary/5 p-6 shadow-md">
              <div className="mono-num mb-1 text-[10px] uppercase font-bold tracking-wider text-primary">
                Final Answer
              </div>
              {solution.final.latex ? (
                <div className="overflow-x-auto">
                  <Latex tex={solution.final.latex} block />
                </div>
              ) : (
                <div className="mono-num text-2xl font-bold">
                  {solution.final.value}{" "}
                  <span className="text-sm text-primary">{solution.final.unit}</span>
                </div>
              )}
            </div>

            {solution.notes && (
              <div className="rounded-xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
                <span className="mr-1.5 font-bold text-foreground">Note:</span>
                {solution.notes}
              </div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="mono-num mb-2 text-[10px] uppercase font-bold tracking-wider text-primary">
        {title}
      </div>
      <ul className="space-y-1.5 text-xs text-muted-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
