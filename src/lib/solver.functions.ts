import { createServerFn } from "@tanstack/react-start";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const SolveInput = z.object({
  prompt: z.string().min(1).max(4000),
  imageDataUrl: z.string().optional(),
});

export type SolveInputT = z.infer<typeof SolveInput>;

export interface Step {
  title: string;
  explanation: string;
  latex?: string;
}

export interface Plot {
  title: string;
  expression: string; // in variable x
  xMin: number;
  xMax: number;
  yLabel?: string;
  xLabel?: string;
}

export type CircuitElement = {
  type: "R" | "C" | "L" | "V" | "I" | "D" | "GND" | "WIRE";
  label: string; // e.g. "R1", "10 kΩ"
  value?: string;
  from: string; // node id
  to: string; // node id
};

export interface CircuitDiagram {
  kind: "circuit";
  nodes: { id: string; x: number; y: number }[]; // grid coords 0..10
  elements: CircuitElement[];
}

export interface FBDDiagram {
  kind: "fbd";
  body: string;
  forces: { label: string; angleDeg: number; magnitude?: string }[];
}

export type Diagram = CircuitDiagram | FBDDiagram;

export interface Solution {
  domain: string; // e.g. "DC Circuits", "Kinematics"
  given: string[];
  find: string[];
  assumptions: string[];
  steps: Step[];
  final: { value: string; unit: string; latex?: string };
  plot?: Plot;
  diagram?: Diagram;
  notes?: string;
}

function getAiConfig() {
  const lovableKey =
    process.env.LOVABLE_API_KEY?.trim() || process.env.VITE_LOVABLE_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim() || process.env.VITE_GEMINI_API_KEY?.trim();

  const isPlaceholder = (k: string) => !k || /demo|placeholder|changeme/i.test(k);

  if (lovableKey && !isPlaceholder(lovableKey)) {
    return { type: "lovable" as const, key: lovableKey };
  }
  if (geminiKey && !isPlaceholder(geminiKey)) {
    if (geminiKey.startsWith("sk_")) {
      return { type: "lovable" as const, key: geminiKey };
    }
    return { type: "gemini" as const, key: geminiKey };
  }
  return undefined;
}

function createFallbackSolution(prompt: string): Solution {
  const normalizedPrompt = prompt.trim() || "your engineering problem";

  return {
    domain: "General Engineering",
    given: [`Problem statement: ${normalizedPrompt}`],
    find: ["A concise walkthrough and final answer"],
    assumptions: [
      "No API key is configured, so this response is a local fallback.",
      "Add GEMINI_API_KEY or LOVABLE_API_KEY in your environment to enable real AI-generated solutions.",
    ],
    steps: [
      {
        title: "Demo mode",
        explanation:
          "The app is running without a configured API key, so this fallback response keeps the interface usable while showing the expected structure of a solution.",
      },
      {
        title: "Next step",
        explanation:
          "Paste a specific physics or electronics problem to get a fully generated step-by-step solution once the API key is configured.",
      },
    ],
    final: {
      value: "Demo",
      unit: "N/A",
      latex: "Demo",
    },
    notes: "Set GEMINI_API_KEY or LOVABLE_API_KEY to enable real solver responses.",
  };
}

const SYSTEM_PROMPT = `You are eetirp calci, an expert step-by-step solver covering:
- Mathematics (algebra, calculus, trigonometry, linear algebra, matrices, statistics, differential equations)
- Physics (mechanics, kinematics, dynamics, thermodynamics, electromagnetism, optics, waves)
- Electronics (semiconductor devices, analog/digital circuits, op-amps, logic gates, signal filters)
- Electrical engineering (AC/DC circuits, transformers, three-phase power, motors, generators, power systems)
- Mechanical engineering (statics, dynamics, fluid mechanics, heat transfer, machine design, stresses)
- Civil engineering (structural analysis, concrete/steel design, fluid dynamics, soil mechanics, surveying)

For every problem, respond ONLY with a single JSON object matching this TypeScript type (no markdown, no code fences):

{
  "domain": string,
  "given": string[],
  "find": string[],
  "assumptions": string[],
  "steps": Array<{ "title": string, "explanation": string, "latex"?: string }>,
  "final": { "value": string, "unit": string, "latex"?: string },
  "plot"?: { "title": string, "expression": string, "xMin": number, "xMax": number, "xLabel"?: string, "yLabel"?: string },
  "diagram"?:
    | { "kind": "circuit", "nodes": Array<{"id":string,"x":number,"y":number}>, "elements": Array<{"type":"R"|"C"|"L"|"V"|"I"|"D"|"GND"|"WIRE","label":string,"value"?:string,"from":string,"to":string}> }
    | { "kind": "fbd", "body": string, "forces": Array<{"label":string,"angleDeg":number,"magnitude"?:string}> },
  "notes"?: string
}

RULES:
- 3 to 8 clear steps. Each "latex" field is a raw KaTeX-compatible expression (no $ delimiters).
- Use SI units. Include units on final answer.
- Include "plot" ONLY when a graph adds clarity (waveforms, transient responses, motion trajectories, force curves). "expression" must be a JavaScript-style expression in variable x (e.g. "5*exp(-x/0.01)*sin(2*pi*60*x)").
- Include "diagram" of kind "circuit" for circuit problems, or "fbd" for mechanics problems with forces. Circuit node coordinates use a 0..10 integer grid. Use "WIRE" for plain connections.
- If the input is not a solvable engineering/physics problem, return steps explaining what's needed and set final.value to "N/A".
- Never wrap output in markdown fences. Output MUST be valid JSON parseable by JSON.parse.`;

export const solveProblem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => SolveInput.parse(data))
  .handler(async ({ data }): Promise<Solution> => {
    const config = getAiConfig();
    if (!config) return createFallbackSolution(data.prompt);

    const model =
      config.type === "lovable"
        ? createLovableAiGatewayProvider(config.key)("google/gemini-3.5-flash")
        : createGoogleGenerativeAI({ apiKey: config.key })("gemini-3.5-flash");

    const userContent: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [
      { type: "text", text: data.prompt },
    ];
    if (data.imageDataUrl) {
      userContent.push({ type: "image", image: data.imageDataUrl });
    }

    let result;
    try {
      result = await generateText({
        model,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) throw new Error("Rate limited. Please wait a moment and try again.");
      if (msg.includes("402"))
        throw new Error("AI credits exhausted. Add credits to your Gemini account.");
      throw new Error(msg);
    }

    const text = result.text.trim();
    // Strip fenced code if the model ignored instructions
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      return JSON.parse(cleaned) as Solution;
    } catch {
      // Try to extract the first {...} block
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]) as Solution;
        } catch {
          /* fall through */
        }
      }
      throw new Error("The model returned an unparseable response. Please rephrase and retry.");
    }
  });
