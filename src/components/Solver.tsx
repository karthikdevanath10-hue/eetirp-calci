import { useEffect, useRef, useState } from "react";
import { parseAndSolve } from "@/lib/nlp-router";
import { type Solution } from "@/lib/programmatic-solvers";
import { Latex } from "./Latex";

const SUBJECTS = ["Maths", "Physics", "Electronics", "Electrical", "Mechanical", "Civil"];

interface TemplateVariable {
  name: string;
  label: string;
  placeholder: string;
  unit?: string;
}

interface Template {
  name: string;
  query: string;
  description: string;
  variables: TemplateVariable[];
  queryFormatter: (vals: Record<string, string>) => string;
}

const TEMPLATES: Record<string, Template[]> = {
  Maths: [
    {
      name: "Linear Equation",
      query: "ax + b = c",
      description: "Solves standard ax + b = c equations.",
      variables: [
        { name: "a", label: "Coefficient a", placeholder: "3" },
        { name: "b", label: "Constant b", placeholder: "5" },
        { name: "c", label: "Result c", placeholder: "20" },
      ],
      queryFormatter: (v) => `${v.a}x + ${v.b} = ${v.c}`,
    },
    {
      name: "Quadratic Equation",
      query: "ax^2 + bx + c = 0",
      description: "Calculates real and complex roots, discriminant, and vertex coordinates.",
      variables: [
        { name: "a", label: "Coefficient a", placeholder: "1" },
        { name: "b", label: "Coefficient b", placeholder: "-5" },
        { name: "c", label: "Constant c", placeholder: "6" },
      ],
      queryFormatter: (v) => `${v.a}x^2 + ${v.b}x + ${v.c} = 0`,
    },
    {
      name: "System of 2 Equations",
      query: "a1x + b1y = c1 and a2x + b2y = c2",
      description: "Solves two linear equations using Cramer's determinant rule.",
      variables: [
        { name: "a1", label: "a1", placeholder: "2" },
        { name: "b1", label: "b1", placeholder: "3" },
        { name: "c1", label: "c1", placeholder: "12" },
        { name: "a2", label: "a2", placeholder: "1" },
        { name: "b2", label: "b2", placeholder: "-1" },
        { name: "c2", label: "c2", placeholder: "1" },
      ],
      queryFormatter: (v) => `${v.a1}x + ${v.b1}y = ${v.c1} and ${v.a2}x + ${v.b2}y = ${v.c2}`,
    },
    {
      name: "Matrix 2x2 Determinant",
      query: "matrix determinant: [[a, b], [c, d]]",
      description: "Calculates the determinant of a 2x2 matrix step-by-step.",
      variables: [
        { name: "a", label: "a (row 1, col 1)", placeholder: "3" },
        { name: "b", label: "b (row 1, col 2)", placeholder: "5" },
        { name: "c", label: "c (row 2, col 1)", placeholder: "2" },
        { name: "d", label: "d (row 2, col 2)", placeholder: "8" },
      ],
      queryFormatter: (v) => `matrix determinant: [[${v.a}, ${v.b}], [${v.c}, ${v.d}]]`,
    },
    {
      name: "Vector Cross Product",
      query: "vector cross product: u = [u1, u2, u3], v = [v1, v2, v3]",
      description: "Computes the 3D cross product vector components.",
      variables: [
        { name: "u1", label: "u1", placeholder: "2" },
        { name: "u2", label: "u2", placeholder: "3" },
        { name: "u3", label: "u3", placeholder: "4" },
        { name: "v1", label: "v1", placeholder: "5" },
        { name: "v2", label: "v2", placeholder: "6" },
        { name: "v3", label: "v3", placeholder: "7" },
      ],
      queryFormatter: (v) =>
        `vector cross product: u = [${v.u1}, ${v.u2}, ${v.u3}], v = [${v.v1}, ${v.v2}, ${v.v3}]`,
    },
  ],
  Physics: [
    {
      name: "Projectile Motion",
      query: "projectile motion: velocity = v, angle = theta",
      description: "Solves flight time, horizontal range, and peak height.",
      variables: [
        { name: "v", label: "Launch velocity (v)", placeholder: "25", unit: "m/s" },
        { name: "theta", label: "Launch angle (θ)", placeholder: "40", unit: "deg" },
      ],
      queryFormatter: (v) => `projectile motion: velocity = ${v.v}, angle = ${v.theta}`,
    },
    {
      name: "Kinematics (SUVAT)",
      query: "kinematics: initial velocity = u, acceleration = a, time = t",
      description: "Calculates displacement, final velocity, and time variables.",
      variables: [
        { name: "u", label: "Initial velocity (u)", placeholder: "0", unit: "m/s" },
        { name: "a", label: "Acceleration (a)", placeholder: "3", unit: "m/s²" },
        { name: "t", label: "Time duration (t)", placeholder: "8", unit: "s" },
      ],
      queryFormatter: (v) =>
        `kinematics: initial velocity = ${v.u}, acceleration = ${v.a}, time = ${v.t}`,
    },
    {
      name: "Dynamics: Force & Friction",
      query: "friction force: mass = m, acceleration = a, friction coefficient = mu",
      description: "Calculates normal force, friction, and total driving force Fn, Ff, F.",
      variables: [
        { name: "m", label: "Mass (m)", placeholder: "50", unit: "kg" },
        { name: "a", label: "Acceleration (a)", placeholder: "2", unit: "m/s²" },
        { name: "mu", label: "Friction coeff (μ)", placeholder: "0.3" },
      ],
      queryFormatter: (v) =>
        `friction force: mass = ${v.m}, acceleration = ${v.a}, friction coefficient = ${v.mu}`,
    },
    {
      name: "Centripetal Force",
      query: "centripetal force: mass = m, velocity = v, radius = r",
      description: "Calculates centripetal acceleration and inward force Fc.",
      variables: [
        { name: "m", label: "Mass (m)", placeholder: "2.5", unit: "kg" },
        { name: "v", label: "Tangential speed (v)", placeholder: "12", unit: "m/s" },
        { name: "r", label: "Orbit radius (r)", placeholder: "4", unit: "m" },
      ],
      queryFormatter: (v) => `centripetal force: mass = ${v.m}, velocity = ${v.v}, radius = ${v.r}`,
    },
  ],
  Electronics: [
    {
      name: "Ohm's Law",
      query: "ohm's law: current = i, resistance = r",
      description: "Solves for the missing parameter (V, I, or R) given any two inputs.",
      variables: [
        { name: "i", label: "Current (I)", placeholder: "2", unit: "A" },
        { name: "r", label: "Resistance (R)", placeholder: "10", unit: "Ω" },
      ],
      queryFormatter: (v) => `ohm's law: current = ${v.i}, resistance = ${v.r}`,
    },
    {
      name: "Resistor Network",
      query: "parallel resistors: r1, r2, r3",
      description: "Calculates the total equivalent resistance for series or parallel connections.",
      variables: [
        { name: "r1", label: "Resistor 1 (R1)", placeholder: "100", unit: "Ω" },
        { name: "r2", label: "Resistor 2 (R2)", placeholder: "220", unit: "Ω" },
        { name: "r3", label: "Resistor 3 (R3)", placeholder: "470", unit: "Ω" },
      ],
      queryFormatter: (v) => `parallel resistors: ${v.r1}, ${v.r2}, ${v.r3}`,
    },
    {
      name: "Voltage Divider Circuit",
      query: "voltage divider: input voltage = vin, resistor 1 = r1, resistor 2 = r2",
      description: "Calculates output voltage across R2 in series divider networks.",
      variables: [
        { name: "vin", label: "Input voltage (Vin)", placeholder: "12", unit: "V" },
        { name: "r1", label: "Resistor 1 (R1)", placeholder: "1000", unit: "Ω" },
        { name: "r2", label: "Resistor 2 (R2)", placeholder: "2200", unit: "Ω" },
      ],
      queryFormatter: (v) =>
        `voltage divider: input voltage = ${v.vin}, resistor 1 = ${v.r1}, resistor 2 = ${v.r2}`,
    },
  ],
  Electrical: [
    {
      name: "RLC AC Impedance",
      query: "RLC circuit: resistance = r, inductance = l, capacitance = c, frequency = f",
      description: "Computes inductive/capacitive reactances, total impedance, and phase angle.",
      variables: [
        { name: "r", label: "Resistance (R)", placeholder: "100", unit: "Ω" },
        { name: "l", label: "Inductance (L)", placeholder: "50", unit: "mH" },
        { name: "c", label: "Capacitance (C)", placeholder: "10", unit: "μF" },
        { name: "f", label: "Frequency (f)", placeholder: "500", unit: "Hz" },
      ],
      queryFormatter: (v) =>
        `RLC circuit: resistance = ${v.r}, inductance = ${v.l}, capacitance = ${v.c}, frequency = ${v.f}`,
    },
    {
      name: "Transformer Turns Ratio",
      query: "transformer: primary voltage = vp, primary turns = np, secondary turns = ns",
      description: "Calculates turns step factor and secondary output voltage Vs.",
      variables: [
        { name: "vp", label: "Primary Voltage (Vp)", placeholder: "240", unit: "V" },
        { name: "np", label: "Primary winding turns (Np)", placeholder: "400" },
        { name: "ns", label: "Secondary winding turns (Ns)", placeholder: "20" },
      ],
      queryFormatter: (v) =>
        `transformer: primary voltage = ${v.vp}, primary turns = ${v.np}, secondary turns = ${v.ns}`,
    },
  ],
  Mechanical: [
    {
      name: "Beam Bending",
      query: "beam: length = l, load = p",
      description: "Solves support reactions, max bending moment, and maximum shear force.",
      variables: [
        { name: "l", label: "Beam length (L)", placeholder: "6", unit: "m" },
        { name: "p", label: "Concentrated point load (P)", placeholder: "10", unit: "kN" },
      ],
      queryFormatter: (v) => `beam: length = ${v.l}, load = ${v.p}`,
    },
    {
      name: "Heat Conduction",
      query:
        "heat conduction: conductivity = k, area = a, thickness = d, inside = t1, outside = t2",
      description: "Calculates steady-state 1D heat flow rate through a material boundary.",
      variables: [
        { name: "k", label: "Thermal conductivity (k)", placeholder: "0.8", unit: "W/m·K" },
        { name: "a", label: "Surface area (A)", placeholder: "15", unit: "m²" },
        { name: "d", label: "Thickness (d)", placeholder: "10", unit: "cm" },
        { name: "t1", label: "Inner temperature (T1)", placeholder: "22", unit: "°C" },
        { name: "t2", label: "Outer temperature (T2)", placeholder: "4", unit: "°C" },
      ],
      queryFormatter: (v) =>
        `heat conduction: conductivity = ${v.k}, area = ${v.a}, thickness = ${v.d}, inside = ${v.t1}, outside = ${v.t2}`,
    },
    {
      name: "Hydrostatic Fluid Pressure",
      query: "fluid pressure: density = rho, height = h",
      description: "Calculates hydrostatic pressure at depth h in Pascals and kPa.",
      variables: [
        { name: "rho", label: "Fluid density (ρ)", placeholder: "1000", unit: "kg/m³" },
        { name: "h", label: "Fluid depth height (h)", placeholder: "15", unit: "m" },
      ],
      queryFormatter: (v) => `fluid pressure: density = ${v.rho}, height = ${v.h}`,
    },
    {
      name: "Gear Speed Ratio",
      query: "gear speed: driver teeth = t1, driven teeth = t2, driver speed = n1",
      description: "Calculates gear transmission ratio and driven output speed N2.",
      variables: [
        { name: "t1", label: "Driver teeth (T1)", placeholder: "12" },
        { name: "t2", label: "Driven teeth (T2)", placeholder: "36" },
        { name: "n1", label: "Driver speed (N1)", placeholder: "1800", unit: "RPM" },
      ],
      queryFormatter: (v) =>
        `gear speed: driver teeth = ${v.t1}, driven teeth = ${v.t2}, driver speed = ${v.n1}`,
    },
  ],
  Civil: [
    {
      name: "Active Earth Pressure",
      query: "earth pressure: wall height = h, weight = gamma, friction = phi",
      description:
        "Solves Rankine's lateral soil thrust pressure coefficient and resultant forces.",
      variables: [
        { name: "h", label: "Wall retaining height (H)", placeholder: "5", unit: "m" },
        { name: "gamma", label: "Soil unit weight (γ)", placeholder: "18", unit: "kN/m³" },
        { name: "phi", label: "Friction internal angle (φ)", placeholder: "30", unit: "deg" },
      ],
      queryFormatter: (v) =>
        `earth pressure: wall height = ${v.h}, weight = ${v.gamma}, friction = ${v.phi}`,
    },
    {
      name: "Concrete spec Compressive Strength",
      query: "concrete strength: load = p, diameter = d",
      description:
        "Calculates cross-sectional area and compressive strength of specimen cylinders.",
      variables: [
        { name: "p", label: "Failure point load (P)", placeholder: "530", unit: "kN" },
        { name: "d", label: "Specimen diameter (D)", placeholder: "150", unit: "mm" },
      ],
      queryFormatter: (v) => `concrete strength: load = ${v.p}, diameter = ${v.d}`,
    },
    {
      name: "Euler Column Buckling",
      query: "column buckling: elastic modulus = e, moment of inertia = i, length = l, factor = k",
      description: "Calculates effective column length and critical buckling load Pcr.",
      variables: [
        { name: "e", label: "Elastic Modulus (E)", placeholder: "200", unit: "GPa" },
        { name: "i", label: "Inertia Area Moment (I)", placeholder: "8000", unit: "cm⁴" },
        { name: "l", label: "Column height length (L)", placeholder: "4", unit: "m" },
        { name: "k", label: "Effective factor (K)", placeholder: "0.7" },
      ],
      queryFormatter: (v) =>
        `column buckling: elastic modulus = ${v.e}, moment of inertia = ${v.i}, length = ${v.l}, factor = ${v.k}`,
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
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
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

    let queryToSolve = prompt;
    if (selectedTemplate) {
      const missing = selectedTemplate.variables.filter((v) => !templateValues[v.name]?.trim());
      if (missing.length > 0) {
        setError(`Please fill in all parameter values (${missing.map((m) => m.name).join(", ")})`);
        setLoading(false);
        return;
      }
      queryToSolve = selectedTemplate.queryFormatter(templateValues);
    }

    // Dynamic timeout to simulate resolving
    setTimeout(() => {
      try {
        const sol = parseAndSolve(activeSubject, queryToSolve);
        if (sol) {
          setSolution(sol);
        } else {
          setError(
            `Question format not recognized. Please review and check the input parameters for ${activeSubject}.`,
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
              value={selectedTemplate?.name || ""}
              onChange={(e) => {
                const val = e.target.value;
                const found = TEMPLATES[activeSubject]?.find((t) => t.name === val) || null;
                setSelectedTemplate(found);
                setTemplateValues({});
                setError(null);
                setSolution(null);
              }}
              className="w-full rounded-xl border border-border bg-card px-3.5 py-3 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition cursor-pointer dark:bg-[#131b2e]"
            >
              <option value="" className="bg-card text-foreground dark:bg-[#131b2e]">
                -- Write free-form question (type below) --
              </option>
              {TEMPLATES[activeSubject]?.map((t, idx) => (
                <option
                  key={idx}
                  value={t.name}
                  className="bg-card text-foreground dark:bg-[#131b2e]"
                >
                  {t.name} ({t.query})
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate ? (
            <div className="space-y-4 rounded-xl border border-border bg-input/20 p-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                    Template: {selectedTemplate.name}
                  </span>
                  <div className="text-xs font-mono text-muted-foreground mt-0.5">
                    Structure: {selectedTemplate.query}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(null);
                    setTemplateValues({});
                    setPrompt("");
                  }}
                  className="text-xs text-destructive hover:underline font-semibold"
                >
                  ✕ Clear / Free-form
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {selectedTemplate.variables.map((v) => (
                  <div key={v.name} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span>{v.label}</span>
                      <span className="mono-num text-[10px] text-muted-foreground font-bold">
                        ({v.name} =)
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={templateValues[v.name] || ""}
                        onChange={(e) => {
                          setTemplateValues((prev) => ({
                            ...prev,
                            [v.name]: e.target.value,
                          }));
                        }}
                        placeholder={`e.g. ${v.placeholder}`}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      />
                      {v.unit && (
                        <span className="text-xs text-muted-foreground font-semibold min-w-[35px]">
                          {v.unit}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Type your ${activeSubject} question (or select a template above)...`}
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-input/40 p-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          )}

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
