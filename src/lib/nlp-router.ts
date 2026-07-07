import {
  solveLinear,
  solveQuadratic,
  solveSystem2D,
  solveProjectile,
  solveKinematics,
  solveOhmsLaw,
  solveResistorNetwork,
  solveRLC,
  solveBeamBending,
  solveHeatConduction,
  solveEarthPressure,
  solveConcreteStrength,
  solveMatrixDet2x2,
  solveVectorCross,
  solveNewtonFriction,
  solveCentripetal,
  solveVoltageDivider,
  solveTransformer,
  solveHydrostatic,
  solveGearRatio,
  solveEulerBuckling,
  type Solution,
} from "./programmatic-solvers";

/**
 * Extracts all numbers from a string.
 */
function extractNumbers(str: string): number[] {
  const matches = str.match(/[-+]?\d*\.?\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Extracts a labeled number, e.g. "v0 = 25", "velocity: 25", "25 m/s", "u=0"
 */
function extractVal(str: string, keys: string[]): number | null {
  for (const key of keys) {
    // Matches patterns like "key = 25", "key: 25", "key of 25", "key is 25"
    const regex = new RegExp(`${key}\\s*(?:=||is|of|:)\\s*([-+]?\\d*\\.?\\d+)`, "i");
    const m = str.match(regex);
    if (m && m[1]) {
      const val = parseFloat(m[1]);
      if (!isNaN(val)) return val;
    }
  }
  return null;
}

export function parseAndSolve(subject: string, query: string): Solution | null {
  const q = query.trim();
  if (!q) return null;

  const normalizedSubject = subject.toLowerCase();

  // =========================================================================
  // MATHEMATICS SOLVERS
  // =========================================================================
  if (normalizedSubject === "maths" || normalizedSubject === "mathematics") {
    // 1. Matrix Determinant
    if (
      q.toLowerCase().includes("matrix") ||
      q.toLowerCase().includes("det") ||
      q.toLowerCase().includes("determinant")
    ) {
      const nums = extractNumbers(q);
      if (nums.length >= 4) {
        return solveMatrixDet2x2(nums[0], nums[1], nums[2], nums[3]);
      }
    }

    // 2. Vector Cross Product
    if (q.toLowerCase().includes("cross") || q.toLowerCase().includes("vector")) {
      const nums = extractNumbers(q);
      if (nums.length >= 6) {
        return solveVectorCross(nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]);
      }
    }

    // 3. Quadratic Equation: ax^2 + bx + c = 0
    if (q.includes("x^2") || q.includes("x²") || q.toLowerCase().includes("quadratic")) {
      const quadRegex =
        /(-?\d*\.?\d*)\s*x[\^²]2\s*(?:([+-]\s*\d*\.?\d*)\s*x)?\s*(?:([+-]\s*\d*\.?\d*))?\s*=\s*0/i;
      const match = q.replace(/\s+/g, "").match(quadRegex);

      let a = 1;
      let b = 0;
      let c = 0;

      if (match) {
        const aStr = match[1];
        if (aStr === "-") a = -1;
        else if (aStr && aStr !== "+") a = parseFloat(aStr);

        const bStr = match[2];
        if (bStr) {
          const val = parseFloat(bStr.replace("+", ""));
          b = isNaN(val) ? (bStr.startsWith("-") ? -1 : 1) : val;
        }

        const cStr = match[3];
        if (cStr) {
          c = parseFloat(cStr.replace("+", ""));
        }

        return solveQuadratic(a, b, c);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 3) {
        return solveQuadratic(nums[0], nums[1], nums[2]);
      }
    }

    // 4. 2D System of Equations: a1x + b1y = c1 and a2x + b2y = c2
    if (
      q.includes("y") &&
      (q.includes("system") || q.includes("and") || q.includes(",") || q.includes("\n"))
    ) {
      const eqRegex = /(-?\d*\.?\d*)\s*x\s*([+-]\s*\d*\.?\d*)\s*y\s*=\s*(-?\d*\.?\d*)/gi;
      const matches = [...q.replace(/\s+/g, "").matchAll(eqRegex)];

      if (matches.length >= 2) {
        const parseCoeff = (m: RegExpExecArray) => {
          let a = 1,
            b = 1,
            c = 0;

          const aStr = m[1];
          if (aStr === "-") a = -1;
          else if (aStr && aStr !== "+") a = parseFloat(aStr);

          const bStr = m[2];
          if (bStr) {
            const val = parseFloat(bStr.replace("+", ""));
            b = isNaN(val) ? (bStr.startsWith("-") ? -1 : 1) : val;
          }

          c = parseFloat(m[3]);
          return { a, b, c };
        };

        const eq1 = parseCoeff(matches[0]);
        const eq2 = parseCoeff(matches[1]);
        return solveSystem2D(eq1.a, eq1.b, eq1.c, eq2.a, eq2.b, eq2.c);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 6) {
        return solveSystem2D(nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]);
      }
    }

    // 5. Linear Equation: ax + b = c
    if (q.includes("x") || q.includes("linear")) {
      const linRegex = /(-?\d*\.?\d*)\s*x\s*(?:([+-]\s*\d*\.?\d*))?\s*=\s*(-?\d*\.?\d*)/i;
      const match = q.replace(/\s+/g, "").match(linRegex);

      let a = 1;
      let b = 0;
      let c = 0;

      if (match) {
        const aStr = match[1];
        if (aStr === "-") a = -1;
        else if (aStr && aStr !== "+") a = parseFloat(aStr);

        const bStr = match[2];
        if (bStr) {
          b = parseFloat(bStr.replace("+", ""));
        }

        c = parseFloat(match[3]);
        return solveLinear(a, b, c);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 3) {
        return solveLinear(nums[0], nums[1], nums[2]);
      }
    }
  }

  // =========================================================================
  // PHYSICS SOLVERS
  // =========================================================================
  if (normalizedSubject === "physics") {
    // 1. Friction & Newton's Second Law
    if (q.toLowerCase().includes("friction") || q.toLowerCase().includes("mass")) {
      const m = extractVal(q, ["m", "mass"]);
      const a = extractVal(q, ["a", "acceleration"]) ?? 0;
      const mu = extractVal(q, ["mu", "coefficient", "friction"]) ?? 0;

      if (m !== null) {
        return solveNewtonFriction(m, a, mu);
      }
    }

    // 2. Centripetal Force
    if (
      q.toLowerCase().includes("centripetal") ||
      q.toLowerCase().includes("circular") ||
      q.toLowerCase().includes("radius")
    ) {
      const m = extractVal(q, ["m", "mass"]);
      const v = extractVal(q, ["v", "velocity", "speed"]);
      const r = extractVal(q, ["r", "radius"]);

      if (m !== null && v !== null && r !== null) {
        return solveCentripetal(m, v, r);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 3) {
        return solveCentripetal(nums[0], nums[1], nums[2]);
      }
    }

    // 3. Projectile Motion
    if (
      q.toLowerCase().includes("projectile") ||
      q.toLowerCase().includes("launch") ||
      q.toLowerCase().includes("angle")
    ) {
      const v0 = extractVal(q, ["v0", "v_0", "velocity", "speed", "launch speed"]);
      const theta = extractVal(q, ["theta", "angle", "launch angle", "deg"]);
      const g = extractVal(q, ["g", "gravity"]) ?? 9.81;

      if (v0 !== null && theta !== null) {
        return solveProjectile(v0, theta, g);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 2) {
        return solveProjectile(nums[0], nums[1], nums[2] ?? 9.81);
      }
    }

    // 4. Kinematics (SUVAT)
    if (
      q.toLowerCase().includes("kinematic") ||
      q.toLowerCase().includes("suvat") ||
      q.toLowerCase().includes("accelerat") ||
      q.toLowerCase().includes("velocity")
    ) {
      const s = extractVal(q, ["s", "displacement", "distance"]);
      const u = extractVal(q, ["u", "initial velocity", "start velocity"]);
      const v = extractVal(q, ["v", "final velocity", "end velocity"]);
      const a = extractVal(q, ["a", "acceleration"]);
      const t = extractVal(q, ["t", "time"]);

      const filled = [s, u, v, a, t].filter((x) => x !== null).length;
      if (filled >= 3) {
        return solveKinematics(s, u, v, a, t);
      }

      const pairs: Record<string, number> = {};
      const keys = ["s", "u", "v", "a", "t"];
      for (const k of keys) {
        const regex = new RegExp(`\\b${k}\\s*=\\s*([-+]?\\d*\\.?\\d+)`, "i");
        const m = q.match(regex);
        if (m && m[1]) {
          pairs[k] = parseFloat(m[1]);
        }
      }
      if (Object.keys(pairs).length >= 3) {
        return solveKinematics(
          pairs.s ?? null,
          pairs.u ?? null,
          pairs.v ?? null,
          pairs.a ?? null,
          pairs.t ?? null,
        );
      }
    }
  }

  // =========================================================================
  // ELECTRONICS / ELECTRICAL SOLVERS
  // =========================================================================
  if (normalizedSubject === "electronics" || normalizedSubject === "electrical") {
    // 1. Voltage Divider
    if (q.toLowerCase().includes("divider") || q.toLowerCase().includes("vOut")) {
      const vIn = extractVal(q, ["vIn", "voltage", "input voltage", "vin"]);
      const r1 = extractVal(q, ["r1", "resistor 1"]);
      const r2 = extractVal(q, ["r2", "resistor 2"]);

      if (vIn !== null && r1 !== null && r2 !== null) {
        return solveVoltageDivider(vIn, r1, r2);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 3) {
        return solveVoltageDivider(nums[0], nums[1], nums[2]);
      }
    }

    // 2. Transformer ratio
    if (q.toLowerCase().includes("transformer") || q.toLowerCase().includes("turns")) {
      const vP = extractVal(q, ["vP", "primary voltage", "vp", "voltage"]);
      const nP = extractVal(q, ["nP", "primary turns", "np"]);
      const nS = extractVal(q, ["nS", "secondary turns", "ns"]);

      if (vP !== null && nP !== null && nS !== null) {
        return solveTransformer(vP, nP, nS);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 3) {
        return solveTransformer(nums[0], nums[1], nums[2]);
      }
    }

    // 3. Resistor Networks (Series/Parallel)
    if (
      q.toLowerCase().includes("resistor") &&
      (q.toLowerCase().includes("series") || q.toLowerCase().includes("parallel"))
    ) {
      const type = q.toLowerCase().includes("parallel") ? "parallel" : "series";
      const nums = extractNumbers(q);
      const resistors = nums.filter((n) => n > 0);
      if (resistors.length > 0) {
        return solveResistorNetwork(resistors, type);
      }
    }

    // 4. RLC series AC Circuit impedance
    if (
      q.toLowerCase().includes("rlc") ||
      (q.toLowerCase().includes("inductance") && q.toLowerCase().includes("capacitance"))
    ) {
      const R = extractVal(q, ["r", "resistance"]);
      const L = extractVal(q, ["l", "inductance", "inductor"]);
      const C = extractVal(q, ["c", "capacitance", "capacitor"]);
      const f = extractVal(q, ["f", "frequency"]);

      if (R !== null && L !== null && C !== null && f !== null) {
        return solveRLC(R, L, C, f);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 4) {
        return solveRLC(nums[0], nums[1], nums[2], nums[3]);
      }
    }

    // 5. Ohm's Law (V, I, R)
    if (
      q.toLowerCase().includes("ohm") ||
      q.toLowerCase().includes("resistance") ||
      q.toLowerCase().includes("voltage") ||
      q.toLowerCase().includes("current")
    ) {
      const v = extractVal(q, ["v", "voltage", "volts"]);
      const i = extractVal(q, ["i", "current", "amps", "amperes"]);
      const r = extractVal(q, ["r", "resistance", "ohms"]);

      const filled = [v, i, r].filter((x) => x !== null).length;
      if (filled === 2) {
        return solveOhmsLaw(v, i, r);
      }

      const vMatch = q.match(/v\s*=\s*(\d+\.?\d*)/i);
      const iMatch = q.match(/i\s*=\s*(\d+\.?\d*)/i);
      const rMatch = q.match(/r\s*=\s*(\d+\.?\d*)/i);
      const valV = vMatch ? parseFloat(vMatch[1]) : null;
      const valI = iMatch ? parseFloat(iMatch[1]) : null;
      const valR = rMatch ? parseFloat(rMatch[1]) : null;

      if ([valV, valI, valR].filter((x) => x !== null).length === 2) {
        return solveOhmsLaw(valV, valI, valR);
      }
    }
  }

  // =========================================================================
  // MECHANICAL SOLVERS
  // =========================================================================
  if (normalizedSubject === "mechanical") {
    // 1. Fluid Hydrostatic Pressure
    if (
      q.toLowerCase().includes("hydrostatic") ||
      q.toLowerCase().includes("fluid pressure") ||
      q.toLowerCase().includes("density")
    ) {
      const rho = extractVal(q, ["rho", "density", "fluid density"]);
      const h = extractVal(q, ["h", "height", "depth"]);

      if (rho !== null && h !== null) {
        return solveHydrostatic(rho, h);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 2) {
        return solveHydrostatic(nums[0], nums[1]);
      }
    }

    // 2. Gear Ratio Output Speed
    if (
      q.toLowerCase().includes("gear") ||
      q.toLowerCase().includes("teeth") ||
      q.toLowerCase().includes("rpm")
    ) {
      const t1 = extractVal(q, ["t1", "driver teeth", "t_1"]);
      const t2 = extractVal(q, ["t2", "driven teeth", "t_2"]);
      const n1 = extractVal(q, ["n1", "driver speed", "speed", "n_1"]);

      if (t1 !== null && t2 !== null && n1 !== null) {
        return solveGearRatio(t1, t2, n1);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 3) {
        return solveGearRatio(nums[0], nums[1], nums[2]);
      }
    }

    // 3. Beam Bending
    if (
      q.toLowerCase().includes("beam") ||
      q.toLowerCase().includes("bending") ||
      q.toLowerCase().includes("support")
    ) {
      const length = extractVal(q, ["length", "l", "beam length", "m"]);
      const load = extractVal(q, ["load", "force", "concentrated load", "p", "kn"]);

      if (length !== null && load !== null) {
        return solveBeamBending(length, load);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 2) {
        return solveBeamBending(nums[0], nums[1]);
      }
    }

    // 4. Heat Conduction
    if (
      q.toLowerCase().includes("heat") ||
      q.toLowerCase().includes("conduct") ||
      q.toLowerCase().includes("wall")
    ) {
      const k = extractVal(q, ["k", "conductivity", "thermal conductivity"]);
      const A = extractVal(q, ["a", "area", "wall area"]);
      const d = extractVal(q, ["d", "thickness", "thick"]);
      const t1 = extractVal(q, ["t1", "inside", "temp inside", "t_1"]);
      const t2 = extractVal(q, ["t2", "outside", "temp outside", "t_2"]);

      if (k !== null && A !== null && d !== null && t1 !== null && t2 !== null) {
        return solveHeatConduction(k, A, d, t1, t2);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 5) {
        return solveHeatConduction(nums[0], nums[1], nums[2], nums[3], nums[4]);
      }
    }
  }

  // =========================================================================
  // CIVIL SOLVERS
  // =========================================================================
  if (normalizedSubject === "civil") {
    // 1. Euler Column Buckling
    if (
      q.toLowerCase().includes("buckling") ||
      q.toLowerCase().includes("column") ||
      q.toLowerCase().includes("euler")
    ) {
      const E = extractVal(q, ["e", "modulus", "elastic modulus", "gpa"]);
      const I = extractVal(q, ["i", "inertia", "moment of inertia", "cm4"]);
      const L = extractVal(q, ["l", "length", "column length", "m"]);
      const K = extractVal(q, ["k", "factor", "effective factor"]) ?? 1.0;

      if (E !== null && I !== null && L !== null) {
        return solveEulerBuckling(E, I, L, K);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 3) {
        return solveEulerBuckling(nums[0], nums[1], nums[2], nums[3] ?? 1.0);
      }
    }

    // 2. Earth Pressure
    if (
      q.toLowerCase().includes("pressure") ||
      q.toLowerCase().includes("wall") ||
      q.toLowerCase().includes("retaining")
    ) {
      const H = extractVal(q, ["h", "height", "wall height", "m"]);
      const gamma = extractVal(q, ["gamma", "weight", "unit weight", "density"]);
      const phi = extractVal(q, ["phi", "friction", "friction angle", "angle"]);

      if (H !== null && gamma !== null && phi !== null) {
        return solveEarthPressure(H, gamma, phi);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 3) {
        return solveEarthPressure(nums[0], nums[1], nums[2]);
      }
    }

    // 3. Concrete Compressive Strength
    if (
      q.toLowerCase().includes("concrete") ||
      q.toLowerCase().includes("cylinder") ||
      q.toLowerCase().includes("specimen")
    ) {
      const P = extractVal(q, ["p", "load", "failure load", "kn"]);
      const D = extractVal(q, ["d", "diameter", "specimen diameter", "mm"]);

      if (P !== null && D !== null) {
        return solveConcreteStrength(P, D);
      }

      const nums = extractNumbers(q);
      if (nums.length >= 2) {
        return solveConcreteStrength(nums[0], nums[1]);
      }
    }
  }

  return null;
}
