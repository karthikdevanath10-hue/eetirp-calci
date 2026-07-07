export interface Step {
  title: string;
  explanation: string;
  latex?: string;
}

export interface Solution {
  domain: string;
  given: string[];
  find: string[];
  assumptions: string[];
  steps: Step[];
  final: { value: string; unit: string; latex?: string };
  plot?: {
    title: string;
    expression: string;
    xMin: number;
    xMax: number;
    xLabel?: string;
    yLabel?: string;
  };
  notes?: string;
}

// -------------------------------------------------------------
// 1. Algebra Solver: Linear
// -------------------------------------------------------------
export function solveLinear(a: number, b: number, c: number): Solution {
  const steps: Step[] = [];
  const given = [`Equation: ${a}x + ${b >= 0 ? "+ " + b : b} = ${c}`];
  const find = ["Value of x"];
  const assumptions = ["Linear equation holds", "Coefficients are exact real numbers"];

  steps.push({
    title: "Write down the given equation",
    explanation: "We begin with the standard linear equation form $ax + b = c$.",
    latex: `${a}x ${b >= 0 ? "+ " : ""}${b} = ${c}`,
  });

  if (a === 0) {
    if (b === c) {
      steps.push({
        title: "Analyze coefficients",
        explanation:
          "Since the coefficient of $x$ is 0, the equation reduces to $b = c$. Here $b = c$ is always true.",
        latex: `${b} = ${c}`,
      });
      return {
        domain: "Linear Algebra",
        given,
        find,
        assumptions,
        steps,
        final: { value: "Infinite solutions", unit: "R", latex: "x \\in \\mathbb{R}" },
      };
    } else {
      steps.push({
        title: "Analyze coefficients",
        explanation:
          "Since the coefficient of $x$ is 0, the equation reduces to $b = c$. However, $b \\neq c$.",
        latex: `${b} \\neq ${c}`,
      });
      return {
        domain: "Linear Algebra",
        given,
        find,
        assumptions,
        steps,
        final: { value: "No solution", unit: "N/A", latex: "\\emptyset" },
      };
    }
  }

  const diff = c - b;
  steps.push({
    title: "Isolate the variable term",
    explanation: `Subtract ${b} from both sides to isolate the $x$ term.`,
    latex: `${a}x = ${c} - (${b}) \\implies ${a}x = ${diff}`,
  });

  const x = diff / a;
  const xRounded = Number(x.toFixed(4));
  steps.push({
    title: "Solve for x",
    explanation: `Divide both sides by the coefficient of $x$, which is ${a}.`,
    latex: `x = \\frac{${diff}}{${a}} \\implies x = ${xRounded}`,
  });

  // Simple plot of the linear line: y = a*x + b - c (roots where y = 0)
  const xMin = x - 5;
  const xMax = x + 5;

  return {
    domain: "Linear Equations",
    given,
    find,
    assumptions,
    steps,
    final: { value: String(xRounded), unit: "", latex: `x = ${xRounded}` },
    plot: {
      title: `Graph of y = ${a}x + ${b - c}`,
      expression: `${a}*x + ${b - c}`,
      xMin,
      xMax,
      xLabel: "x",
      yLabel: "y",
    },
  };
}

// -------------------------------------------------------------
// 2. Algebra Solver: Quadratic
// -------------------------------------------------------------
export function solveQuadratic(a: number, b: number, c: number): Solution {
  if (a === 0) {
    return solveLinear(b, c, 0);
  }

  const given = [`Equation: ${a}x² + ${b >= 0 ? "+ " + b : b}x + ${c >= 0 ? "+ " + c : c} = 0`];
  const find = ["Roots of the quadratic equation"];
  const assumptions = ["Standard real coefficients"];
  const steps: Step[] = [];

  steps.push({
    title: "Identify coefficients",
    explanation: `For the quadratic equation $ax^2 + bx + c = 0$, we identify:`,
    latex: `a = ${a},\\quad b = ${b},\\quad c = ${c}`,
  });

  const disc = b * b - 4 * a * c;
  steps.push({
    title: "Calculate the discriminant (D)",
    explanation:
      "The discriminant determines the nature of the roots using the formula $D = b^2 - 4ac$.",
    latex: `D = (${b})^2 - 4(${a})(${c}) = ${b * b} - ${4 * a * c} = ${disc}`,
  });

  let rootsLatex = "";
  let finalValue = "";

  if (disc > 0) {
    const rootD = Math.sqrt(disc);
    const x1 = (-b + rootD) / (2 * a);
    const x2 = (-b - rootD) / (2 * a);
    const x1R = Number(x1.toFixed(4));
    const x2R = Number(x2.toFixed(4));
    steps.push({
      title: "Calculate two distinct real roots",
      explanation: `Since $D > 0$, there are two real roots. We apply the quadratic formula $x = \\frac{-b \\pm \\sqrt{D}}{2a}$.`,
      latex: `x_1 = \\frac{-(${b}) + \\sqrt{${disc}}}{2(${a})} = ${x1R},\\quad x_2 = \\frac{-(${b}) - \\sqrt{${disc}}}{2(${a})} = ${x2R}`,
    });
    rootsLatex = `x_1 = ${x1R},\\quad x_2 = ${x2R}`;
    finalValue = `x = ${x1R}, ${x2R}`;
  } else if (disc === 0) {
    const x = -b / (2 * a);
    const xR = Number(x.toFixed(4));
    steps.push({
      title: "Calculate one double real root",
      explanation: `Since $D = 0$, there is one repeated real root. We apply the simplified formula $x = \\frac{-b}{2a}$.`,
      latex: `x = \\frac{-(${b})}{2(${a})} = ${xR}`,
    });
    rootsLatex = `x = ${xR}`;
    finalValue = `x = ${xR}`;
  } else {
    // disc < 0
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-disc) / (2 * a);
    const rR = Number(realPart.toFixed(4));
    const iR = Number(imagPart.toFixed(4));
    steps.push({
      title: "Calculate two complex conjugate roots",
      explanation: `Since $D < 0$, the roots are complex numbers. We apply the quadratic formula using the imaginary unit $i = \\sqrt{-1}$.`,
      latex: `x_1 = ${rR} + ${iR}i,\\quad x_2 = ${rR} - ${iR}i`,
    });
    rootsLatex = `x = ${rR} \\pm ${iR}i`;
    finalValue = `${rR} ± ${iR}i`;
  }

  // Find vertex to center the plot
  const vertexX = -b / (2 * a);
  const xMin = vertexX - 6;
  const xMax = vertexX + 6;

  return {
    domain: "Quadratic Equations",
    given,
    find,
    assumptions,
    steps,
    final: { value: finalValue, unit: "", latex: rootsLatex },
    plot: {
      title: `Graph of y = ${a}x² + ${b}x + ${c}`,
      expression: `${a}*x^2 + ${b}*x + ${c}`,
      xMin,
      xMax,
      xLabel: "x",
      yLabel: "y",
    },
  };
}

// -------------------------------------------------------------
// 3. Algebra Solver: System of 2 Equations
// -------------------------------------------------------------
export function solveSystem2D(
  a1: number,
  b1: number,
  c1: number,
  a2: number,
  b2: number,
  c2: number,
): Solution {
  const given = [
    `Eq 1: ${a1}x + ${b1 >= 0 ? "+ " + b1 : b1}y = ${c1}`,
    `Eq 2: ${a2}x + ${b2 >= 0 ? "+ " + b2 : b2}y = ${c2}`,
  ];
  const find = ["Values of x and y"];
  const assumptions = ["Linear independent equations"];
  const steps: Step[] = [];

  steps.push({
    title: "Define the matrices for Cramer's Rule",
    explanation:
      "We can solve the system using determinants. The coefficients form determinant $D$, and the constants replace variables for $D_x$ and $D_y$.",
    latex: `D = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix},\\quad D_x = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix},\\quad D_y = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix}`,
  });

  const D = a1 * b2 - a2 * b1;
  steps.push({
    title: "Calculate the main determinant (D)",
    explanation: `Calculate $D = a_1 b_2 - a_2 b_1$.`,
    latex: `D = (${a1})(${b2}) - (${a2})(${b1}) = ${a1 * b2} - ${a2 * b1} = ${D}`,
  });

  if (D === 0) {
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;
    if (Dx === 0 && Dy === 0) {
      steps.push({
        title: "Analyze determinants",
        explanation:
          "Since all determinants $D = D_x = D_y = 0$, the system has infinitely many collinear solutions.",
      });
      return {
        domain: "Systems of Equations",
        given,
        find,
        assumptions,
        steps,
        final: { value: "Infinite solutions", unit: "", latex: "\\text{Collinear}" },
      };
    } else {
      steps.push({
        title: "Analyze determinants",
        explanation:
          "Since the main determinant $D = 0$ but $D_x \\neq 0$, the lines are parallel and have no common intersection.",
      });
      return {
        domain: "Systems of Equations",
        given,
        find,
        assumptions,
        steps,
        final: { value: "No solution", unit: "", latex: "\\emptyset" },
      };
    }
  }

  const Dx = c1 * b2 - c2 * b1;
  steps.push({
    title: "Calculate Dx",
    explanation: `Replace the first column of the coefficients matrix with constants and calculate:`,
    latex: `D_x = (${c1})(${b2}) - (${c2})(${b1}) = ${c1 * b2} - ${c2 * b1} = ${Dx}`,
  });

  const Dy = a1 * c2 - a2 * c1;
  steps.push({
    title: "Calculate Dy",
    explanation: `Replace the second column of the coefficients matrix with constants and calculate:`,
    latex: `D_y = (${a1})(${c2}) - (${a2})(${c1}) = ${a1 * c2} - ${a2 * c1} = ${Dy}`,
  });

  const x = Dx / D;
  const y = Dy / D;
  const xR = Number(x.toFixed(4));
  const yR = Number(y.toFixed(4));

  steps.push({
    title: "Divide determinants to find x and y",
    explanation: "Apply Cramer's formulas $x = \\frac{D_x}{D}$ and $y = \\frac{D_y}{D}$.",
    latex: `x = \\frac{${Dx}}{${D}} = ${xR},\\quad y = \\frac{${Dy}}{${D}} = ${yR}`,
  });

  return {
    domain: "Systems of Equations",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `x = ${xR}, y = ${yR}`,
      unit: "",
      latex: `\\left(x = ${xR},\\ y = ${yR}\\right)`,
    },
  };
}

// -------------------------------------------------------------
// 4. Physics Solver: Projectile Motion
// -------------------------------------------------------------
export function solveProjectile(v0: number, thetaDeg: number, g = 9.81): Solution {
  const given = [
    `Initial Velocity (v₀): ${v0} m/s`,
    `Launch Angle (θ): ${thetaDeg}°`,
    `Gravity (g): ${g} m/s²`,
  ];
  const find = ["Flight Time (Tf)", "Max Height (H)", "Horizontal Range (R)"];
  const assumptions = ["No air resistance", "Launch from ground level"];
  const steps: Step[] = [];

  const thetaRad = (thetaDeg * Math.PI) / 180;
  const sin = Math.sin(thetaRad);
  const cos = Math.cos(thetaRad);
  const sinR = Number(sin.toFixed(4));
  const cosR = Number(cos.toFixed(4));

  steps.push({
    title: "Resolve initial velocity components",
    explanation: `Calculate horizontal ($v_{0x}$) and vertical ($v_{0y}$) velocities.`,
    latex: `v_{0x} = v_0 \\cos\\theta = ${v0} \\times ${cosR} = ${(v0 * cos).toFixed(2)}\\text{ m/s},\\quad v_{0y} = v_0 \\sin\\theta = ${v0} \\times ${sinR} = ${(v0 * sin).toFixed(2)}\\text{ m/s}`,
  });

  const tf = (2 * v0 * sin) / g;
  const tfR = Number(tf.toFixed(3));
  steps.push({
    title: "Calculate total flight time (Tf)",
    explanation:
      "The projectile rises and falls. Time of flight is calculated when vertical displacement reaches zero: $T_f = \\frac{2 v_0 \\sin\\theta}{g}$.",
    latex: `T_f = \\frac{2 \\times ${v0} \\times \\sin(${thetaDeg}^\\circ)}{${g}} = \\frac{${(2 * v0 * sin).toFixed(3)}}{${g}} = ${tfR}\\text{ s}`,
  });

  const h = (v0 * sin * (v0 * sin)) / (2 * g);
  const hR = Number(h.toFixed(3));
  steps.push({
    title: "Calculate peak height (H)",
    explanation:
      "Maximum height occurs at half-flight time when vertical velocity becomes zero: $H = \\frac{(v_0 \\sin\\theta)^2}{2g}$.",
    latex: `H = \\frac{(${v0} \\times \\sin(${thetaDeg}^\\circ))^2}{2 \\times ${g}} = \\frac{${(v0 * sin * (v0 * sin)).toFixed(3)}}{${2 * g}} = ${hR}\\text{ m}`,
  });

  const range = (v0 * v0 * Math.sin(2 * thetaRad)) / g;
  const rangeR = Number(range.toFixed(3));
  steps.push({
    title: "Calculate horizontal range (R)",
    explanation:
      "Range is total horizontal distance travelled during the flight time: $R = v_{0x} \\times T_f = \\frac{v_0^2 \\sin(2\\theta)}{g}$.",
    latex: `R = \\frac{${v0}^2 \\times \\sin(2 \\times ${thetaDeg}^\\circ)}{${g}} = ${rangeR}\\text{ m}`,
  });

  // Plot details
  // Max x value is Range, let's plot from 0 to Range
  const xMax = range > 0 ? range : 10;

  return {
    domain: "Kinematics",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `Range = ${rangeR} m`,
      unit: "m",
      latex: `R = ${rangeR}\\text{ m}, \\ H = ${hR}\\text{ m}, \\ T_f = ${tfR}\\text{ s}`,
    },
    plot: {
      title: "Trajectory y(x)",
      expression: `${Math.tan(thetaRad)}*x - (${g}*x^2)/(2*${v0}^2*${cos * cos})`,
      xMin: 0,
      xMax: xMax * 1.05,
      xLabel: "Distance (m)",
      yLabel: "Height (m)",
    },
  };
}

// -------------------------------------------------------------
// 5. Physics Solver: Kinematics (SUVAT)
// -------------------------------------------------------------
export function solveKinematics(
  s: number | null,
  u: number | null,
  v: number | null,
  a: number | null,
  t: number | null,
): Solution {
  const given: string[] = [];
  if (s !== null) given.push(`Displacement (s) = ${s} m`);
  if (u !== null) given.push(`Initial Velocity (u) = ${u} m/s`);
  if (v !== null) given.push(`Final Velocity (v) = ${v} m/s`);
  if (a !== null) given.push(`Acceleration (a) = ${a} m/s²`);
  if (t !== null) given.push(`Time (t) = ${t} s`);

  const find = ["Remaining kinematic variables"];
  const assumptions = ["Constant acceleration along a straight line"];
  const steps: Step[] = [];

  // Determine what we have
  const counts = [s, u, v, a, t].filter((x) => x !== null).length;
  if (counts < 3) {
    return {
      domain: "Kinematics",
      given,
      find,
      assumptions,
      steps: [
        {
          title: "Insufficient Variables",
          explanation:
            "To solve equations under constant acceleration, you must provide at least 3 known variables.",
        },
      ],
      final: { value: "N/A", unit: "" },
    };
  }

  // Copy values to local mutable variables
  let outS = s;
  let outU = u;
  let outV = v;
  let outA = a;
  let outT = t;

  // Run algebraic routines to solve
  // Loop up to 2 times to resolve cascades
  for (let loop = 0; loop < 2; loop++) {
    // 1. If we have u, a, t -> find v and s
    if (outU !== null && outA !== null && outT !== null) {
      if (outV === null) {
        outV = outU + outA * outT;
        steps.push({
          title: "Solve for Final Velocity (v)",
          explanation: "Apply the first equation of motion: $v = u + at$.",
          latex: `v = ${outU} + (${outA})(${outT}) = ${outV}\\text{ m/s}`,
        });
      }
      if (outS === null) {
        outS = outU * outT + 0.5 * outA * outT * outT;
        steps.push({
          title: "Solve for Displacement (s)",
          explanation: "Apply the displacement formula: $s = ut + \\frac{1}{2}at^2$.",
          latex: `s = (${outU})(${outT}) + 0.5(${outA})(${outT})^2 = ${outS}\\text{ m}`,
        });
      }
    }

    // 2. If we have u, v, t -> find s and a
    if (outU !== null && outV !== null && outT !== null) {
      if (outS === null) {
        outS = 0.5 * (outU + outV) * outT;
        steps.push({
          title: "Solve for Displacement (s)",
          explanation: "Apply average velocity displacement formula: $s = \\frac{u+v}{2}t$.",
          latex: `s = \\frac{${outU} + ${outV}}{2}(${outT}) = ${outS}\\text{ m}`,
        });
      }
      if (outA === null) {
        outA = outT !== 0 ? (outV - outU) / outT : 0;
        steps.push({
          title: "Solve for Acceleration (a)",
          explanation: "Rearrange $v = u + at$ to solve for acceleration: $a = \\frac{v-u}{t}$.",
          latex: `a = \\frac{${outV} - ${outU}}{${outT}} = ${outA.toFixed(4)}\\text{ m/s}^2`,
        });
      }
    }

    // 3. If we have u, v, a -> find s and t
    if (outU !== null && outV !== null && outA !== null) {
      if (outS === null) {
        outS = outA !== 0 ? (outV * outV - outU * outU) / (2 * outA) : 0;
        steps.push({
          title: "Solve for Displacement (s)",
          explanation: "Apply the equation: $v^2 = u^2 + 2as \\implies s = \\frac{v^2 - u^2}{2a}$.",
          latex: `s = \\frac{${outV}^2 - ${outU}^2}{2(${outA})} = ${outS.toFixed(4)}\\text{ m}`,
        });
      }
      if (outT === null) {
        outT = outA !== 0 ? (outV - outU) / outA : 0;
        steps.push({
          title: "Solve for Time (t)",
          explanation: "Rearrange $v = u + at$ to solve for time: $t = \\frac{v-u}{a}$.",
          latex: `t = \\frac{${outV} - ${outU}}{${outA}} = ${outT.toFixed(4)}\\text{ s}`,
        });
      }
    }

    // 4. If we have s, u, a -> find v and t
    if (outS !== null && outU !== null && outA !== null) {
      if (outV === null) {
        const vSquared = outU * outU + 2 * outA * outS;
        if (vSquared >= 0) {
          outV = Math.sqrt(vSquared); // positive root assumption
          steps.push({
            title: "Solve for Final Velocity (v)",
            explanation: "Apply equation: $v^2 = u^2 + 2as$. Assuming positive direction velocity.",
            latex: `v = \\sqrt{${outU}^2 + 2(${outA})(${outS})} = \\sqrt{${vSquared}} = ${outV.toFixed(4)}\\text{ m/s}`,
          });
        } else {
          return {
            domain: "Kinematics",
            given,
            find,
            assumptions,
            steps: [
              {
                title: "Complex roots",
                explanation:
                  "The physical parameters result in negative squared final velocity ($v^2 < 0$), which is physically impossible in real domains.",
              },
            ],
            final: { value: "Complex Error", unit: "" },
          };
        }
      }
      if (outT === null) {
        // s = ut + 0.5 a t^2 -> 0.5 a t^2 + u t - s = 0
        const quadA = 0.5 * outA;
        const quadB = outU;
        const quadC = -outS;
        const disc = quadB * quadB - 4 * quadA * quadC;
        if (disc >= 0 && quadA !== 0) {
          const t1 = (-quadB + Math.sqrt(disc)) / (2 * quadA);
          const t2 = (-quadB - Math.sqrt(disc)) / (2 * quadA);
          // pick positive time
          outT = t1 >= 0 ? t1 : t2;
          steps.push({
            title: "Solve for Time (t)",
            explanation:
              "Solve the quadratic displacement equation: $\\frac{1}{2}at^2 + ut - s = 0$.",
            latex: `t = \\frac{-(${outU}) \\pm \\sqrt{${disc.toFixed(3)}}}{2(${quadA})} = ${outT.toFixed(4)}\\text{ s}`,
          });
        }
      }
    }

    // 5. If we have s, v, a -> find u and t
    if (outS !== null && outV !== null && outA !== null) {
      if (outU === null) {
        const uSquared = outV * outV - 2 * outA * outS;
        if (uSquared >= 0) {
          outU = Math.sqrt(uSquared);
          steps.push({
            title: "Solve for Initial Velocity (u)",
            explanation: "Apply equation: $v^2 = u^2 + 2as \\implies u = \\sqrt{v^2 - 2as}$.",
            latex: `u = \\sqrt{${outV}^2 - 2(${outA})(${outS})} = ${outU.toFixed(4)}\\text{ m/s}`,
          });
        }
      }
      if (outT === null && outA !== 0) {
        outT = (outV - (outU ?? 0)) / outA;
        steps.push({
          title: "Solve for Time (t)",
          explanation: "Solve for time using velocity differential: $t = \\frac{v-u}{a}$.",
          latex: `t = \\frac{${outV} - ${outU}}{${outA}} = ${outT.toFixed(4)}\\text{ s}`,
        });
      }
    }

    // 6. If we have s, u, t -> find a and v
    if (outS !== null && outU !== null && outT !== null && outT !== 0) {
      if (outA === null) {
        outA = (outS - outU * outT) / (0.5 * outT * outT);
        steps.push({
          title: "Solve for Acceleration (a)",
          explanation:
            "Rearrange $s = ut + \\frac{1}{2}at^2$ to solve for acceleration: $a = \\frac{2(s - ut)}{t^2}$.",
          latex: `a = \\frac{2(${outS} - (${outU})(${outT}))}{${outT}^2} = ${outA.toFixed(4)}\\text{ m/s}^2`,
        });
      }
      if (outV === null) {
        outV = outU + outA * outT;
        steps.push({
          title: "Solve for Final Velocity (v)",
          explanation: "Using the resolved acceleration, apply: $v = u + at$.",
          latex: `v = ${outU} + (${outA.toFixed(4)})(${outT}) = ${outV.toFixed(4)}\\text{ m/s}`,
        });
      }
    }
  }

  const finalS = outS !== null ? Number(outS.toFixed(3)) : 0;
  const finalU = outU !== null ? Number(outU.toFixed(3)) : 0;
  const finalV = outV !== null ? Number(outV.toFixed(3)) : 0;
  const finalA = outA !== null ? Number(outA.toFixed(3)) : 0;
  const finalT = outT !== null ? Number(outT.toFixed(3)) : 0;

  return {
    domain: "Kinematics",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `s=${finalS}, v=${finalV}, t=${finalT}`,
      unit: "solved",
      latex: `s = ${finalS}\\text{ m}, \\ u = ${finalU}\\text{ m/s}, \\ v = ${finalV}\\text{ m/s}, \\ a = ${finalA}\\text{ m/s}^2, \\ t = ${finalT}\\text{ s}`,
    },
    plot: {
      title: "Position graph s(t)",
      expression: `${finalU}*x + 0.5*${finalA}*x^2`,
      xMin: 0,
      xMax: finalT > 0 ? finalT * 1.1 : 10,
      xLabel: "Time (s)",
      yLabel: "Position (m)",
    },
  };
}

// -------------------------------------------------------------
// 6. Electronics Solver: Ohm's Law
// -------------------------------------------------------------
export function solveOhmsLaw(v: number | null, i: number | null, r: number | null): Solution {
  const given: string[] = [];
  if (v !== null) given.push(`Voltage (V) = ${v} V`);
  if (i !== null) given.push(`Current (I) = ${i} A`);
  if (r !== null) given.push(`Resistance (R) = ${r} Ω`);

  const find = ["Missing parameter (V, I, or R)"];
  const assumptions = ["Ideal linear resistor conforming to Ohm's Law"];
  const steps: Step[] = [];

  if (v === null && i !== null && r !== null) {
    const val = i * r;
    steps.push({
      title: "Solve for Voltage (V)",
      explanation: "Applying the primary form of Ohm's Law: $V = I \\times R$.",
      latex: `V = (${i}\\text{ A}) \\times (${r}\\ \\Omega) = ${val.toFixed(3)}\\text{ V}`,
    });
    return {
      domain: "Ohm's Law",
      given,
      find,
      assumptions,
      steps,
      final: { value: `${val.toFixed(3)} V`, unit: "V", latex: `V = ${val.toFixed(3)}\\text{ V}` },
    };
  }

  if (i === null && v !== null && r !== null) {
    if (r === 0) {
      steps.push({
        title: "Short Circuit",
        explanation: "Resistance is zero, resulting in infinite current (ideal short circuit).",
        latex: `I = \\frac{${v}}{0} \\to \\infty\\text{ A}`,
      });
      return {
        domain: "Ohm's Law",
        given,
        find,
        assumptions,
        steps,
        final: { value: "Infinity", unit: "A", latex: "I \\to \\infty\\text{ A}" },
      };
    }
    const val = v / r;
    steps.push({
      title: "Solve for Current (I)",
      explanation: "Rearranging Ohm's Law to isolate Current: $I = \\frac{V}{R}$.",
      latex: `I = \\frac{${v}\\text{ V}}{${r}\\ \\Omega} = ${val.toFixed(4)}\\text{ A}`,
    });
    return {
      domain: "Ohm's Law",
      given,
      find,
      assumptions,
      steps,
      final: { value: `${val.toFixed(4)} A`, unit: "A", latex: `I = ${val.toFixed(4)}\\text{ A}` },
    };
  }

  if (r === null && v !== null && i !== null) {
    if (i === 0) {
      steps.push({
        title: "Open Circuit",
        explanation:
          "Current is zero, meaning the resistance is effectively infinite (open circuit).",
        latex: `R = \\frac{${v}}{0} \\to \\infty\\ \\Omega`,
      });
      return {
        domain: "Ohm's Law",
        given,
        find,
        assumptions,
        steps,
        final: { value: "Infinity", unit: "Ω", latex: "R \\to \\infty\\ \\Omega" },
      };
    }
    const val = v / i;
    steps.push({
      title: "Solve for Resistance (R)",
      explanation: "Rearranging Ohm's Law to isolate Resistance: $R = \\frac{V}{I}$.",
      latex: `R = \\frac{${v}\\text{ V}}{${i}\\text{ A}} = ${val.toFixed(3)}\\ \\Omega`,
    });
    return {
      domain: "Ohm's Law",
      given,
      find,
      assumptions,
      steps,
      final: { value: `${val.toFixed(3)} Ω`, unit: "Ω", latex: `R = ${val.toFixed(3)}\\ \\Omega` },
    };
  }

  return {
    domain: "Ohm's Law",
    given,
    find,
    assumptions,
    steps: [
      {
        title: "Incorrect inputs",
        explanation: "Provide exactly two values to compute the missing third value.",
      },
    ],
    final: { value: "N/A", unit: "" },
  };
}

// -------------------------------------------------------------
// 7. Electronics Solver: Series/Parallel Resistors
// -------------------------------------------------------------
export function solveResistorNetwork(resistors: number[], type: "series" | "parallel"): Solution {
  const given = [
    `Network Type: ${type === "series" ? "Series" : "Parallel"}`,
    `Resistor values: ${resistors.join(", ")} Ω`,
  ];
  const find = ["Equivalent Resistance (Req)"];
  const assumptions = ["Ideal linear resistors", "No stray lead resistances"];
  const steps: Step[] = [];

  if (resistors.length === 0) {
    return {
      domain: "Circuit Analysis",
      given,
      find,
      assumptions,
      steps: [{ title: "No resistors", explanation: "Add at least one resistor value." }],
      final: { value: "0", unit: "Ω" },
    };
  }

  if (type === "series") {
    const sum = resistors.reduce((acc, r) => acc + r, 0);
    const sumLatex = resistors.join(" + ");
    steps.push({
      title: "Sum resistors in Series",
      explanation:
        "In a series network, the equivalent resistance is the direct arithmetic sum of all individual resistances: $R_{eq} = R_1 + R_2 + \\dots + R_n$.",
      latex: `R_{eq} = ${sumLatex} = ${sum}\\ \\Omega`,
    });
    return {
      domain: "Resistor Network",
      given,
      find,
      assumptions,
      steps,
      final: { value: `${sum} Ω`, unit: "Ω", latex: `R_{eq} = ${sum}\\ \\Omega` },
    };
  } else {
    // parallel
    const reciprocalSum = resistors.reduce((acc, r) => acc + (r !== 0 ? 1 / r : 0), 0);
    const reciprocalLatex = resistors.map((r) => `\\frac{1}{${r}}`).join(" + ");
    steps.push({
      title: "Calculate parallel reciprocals",
      explanation:
        "In a parallel network, the reciprocal of the equivalent resistance is the sum of the reciprocals of all individual resistances: $\\frac{1}{R_{eq}} = \\sum \\frac{1}{R_i}$.",
      latex: `\\frac{1}{R_{eq}} = ${reciprocalLatex} = ${reciprocalSum.toFixed(6)}\\ \\Omega^{-1}`,
    });

    const req = reciprocalSum !== 0 ? 1 / reciprocalSum : 0;
    const reqR = Number(req.toFixed(3));
    steps.push({
      title: "Invert value for Req",
      explanation:
        "Invert the sum of the reciprocals to obtain the equivalent resistance: $R_{eq} = 1 / \\left(\\sum \\frac{1}{R_i}\\right)$.",
      latex: `R_{eq} = \\frac{1}{${reciprocalSum.toFixed(6)}} = ${reqR}\\ \\Omega`,
    });

    return {
      domain: "Resistor Network",
      given,
      find,
      assumptions,
      steps,
      final: { value: `${reqR} Ω`, unit: "Ω", latex: `R_{eq} = ${reqR}\\ \\Omega` },
    };
  }
}

// -------------------------------------------------------------
// 8. Electronics Solver: RLC Impedance
// -------------------------------------------------------------
export function solveRLC(R: number, L_mH: number, C_uF: number, f_Hz: number): Solution {
  const L = L_mH * 1e-3; // convert to Henrys
  const C = C_uF * 1e-6; // convert to Farads
  const given = [
    `Resistance (R) = ${R} Ω`,
    `Inductance (L) = ${L_mH} mH (${L.toFixed(6)} H)`,
    `Capacitance (C) = ${C_uF} μF (${C.toFixed(8)} F)`,
    `Frequency (f) = ${f_Hz} Hz`,
  ];
  const find = ["Reactances (XL, XC)", "Total Reactance (X)", "Impedance (Z)", "Phase Angle (θ)"];
  const assumptions = [
    "Pure sinusoidal AC signal source drive",
    "Ideal components without parasitic elements",
  ];
  const steps: Step[] = [];

  const omega = 2 * Math.PI * f_Hz;
  steps.push({
    title: "Calculate Angular Frequency (ω)",
    explanation: "Angular frequency is calculated using $\\omega = 2\\pi f$.",
    latex: `\\omega = 2 \\pi (${f_Hz}) = ${omega.toFixed(2)}\\text{ rad/s}`,
  });

  const xl = omega * L;
  steps.push({
    title: "Calculate Inductive Reactance (XL)",
    explanation: "Inductive reactance is calculated using $X_L = \\omega L$.",
    latex: `X_L = ${omega.toFixed(2)} \\times ${L.toFixed(6)} = ${xl.toFixed(3)}\\ \\Omega`,
  });

  const xc = omega * C !== 0 ? 1 / (omega * C) : 0;
  steps.push({
    title: "Calculate Capacitive Reactance (XC)",
    explanation: "Capacitive reactance is calculated using $X_C = \\frac{1}{\\omega C}$.",
    latex: `X_C = \\frac{1}{${omega.toFixed(2)} \\times ${C.toFixed(8)}} = ${xc.toFixed(3)}\\ \\Omega`,
  });

  const x = xl - xc;
  steps.push({
    title: "Calculate Total Reactance (X)",
    explanation:
      "Total reactance is the difference between inductive and capacitive reactances: $X = X_L - X_C$.",
    latex: `X = ${xl.toFixed(3)} - ${xc.toFixed(3)} = ${x.toFixed(3)}\\ \\Omega`,
  });

  const z = Math.sqrt(R * R + x * x);
  const zR = Number(z.toFixed(3));
  steps.push({
    title: "Calculate Impedance (Z)",
    explanation:
      "Impedance is the total opposition to AC current, acting as vector sum of resistance and reactance: $Z = \\sqrt{R^2 + X^2}$.",
    latex: `Z = \\sqrt{${R}^2 + (${x.toFixed(3)})^2} = \\sqrt{${(R * R).toFixed(2)} + ${(x * x).toFixed(2)}} = ${zR}\\ \\Omega`,
  });

  const thetaRad = Math.atan2(x, R);
  const thetaDeg = (thetaRad * 180) / Math.PI;
  const thetaDegR = Number(thetaDeg.toFixed(2));
  steps.push({
    title: "Calculate Phase Angle (θ)",
    explanation:
      "The phase angle represents the phase shift between voltage and current: $\\theta = \\arctan\\left(\\frac{X}{R}\\right)$.",
    latex: `\\theta = \\arctan\\left(\\frac{${x.toFixed(3)}}{${R}}\\right) = ${thetaRad.toFixed(4)}\\text{ rad} = ${thetaDegR}^\\circ`,
  });

  return {
    domain: "RLC AC Circuits",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${zR} Ω`,
      unit: "Ω",
      latex: `Z = ${zR}\\ \\Omega,\\quad \\theta = ${thetaDegR}^\\circ`,
    },
    plot: {
      title: "Frequency vs Reactances & Impedance",
      // Plot R, XL(x) and XC(x). For visualization, let's plot Z(x) = sqrt(R^2 + (2*pi*x*L - 1/(2*pi*x*C))^2)
      expression: `sqrt(${R * R} + (2*pi*x*${L} - 1/(2*pi*x*${C}))^2)`,
      xMin: Math.max(1, f_Hz - 200),
      xMax: f_Hz + 200,
      xLabel: "Frequency (Hz)",
      yLabel: "Impedance (Ω)",
    },
  };
}

// -------------------------------------------------------------
// 9. Mechanical Solver: Beam Bending
// -------------------------------------------------------------
export function solveBeamBending(L: number, P_kN: number): Solution {
  const given = [`Beam Length (L) = ${L} m`, `Concentrated Load (P) = ${P_kN} kN`];
  const find = [
    "Support Reactions (R1, R2)",
    "Max Bending Moment (Mmax)",
    "Max Shear Force (Vmax)",
  ];
  const assumptions = [
    "Simply supported beam at both ends",
    "Weight of the beam is negligible",
    "Linear elastic material behavior",
  ];
  const steps: Step[] = [];

  const r1 = P_kN / 2;
  const r2 = P_kN / 2;
  steps.push({
    title: "Calculate Support Reactions",
    explanation:
      "For a symmetric concentrated load P at the center of a simply supported beam, the reaction forces at both supports are equal to half the total load.",
    latex: `R_1 = R_2 = \\frac{P}{2} = \\frac{${P_kN}}{2} = ${r1}\\text{ kN}`,
  });

  const mMax = (P_kN * L) / 4;
  steps.push({
    title: "Calculate Maximum Bending Moment (Mmax)",
    explanation:
      "The maximum bending moment occurs directly under the concentrated load (at the beam center, x = L/2): $M_{max} = \\frac{PL}{4}$.",
    latex: `M_{max} = \\frac{P \\times L}{4} = \\frac{${P_kN} \\times ${L}}{4} = ${mMax}\\text{ kN\\cdot m}`,
  });

  const vMax = P_kN / 2;
  steps.push({
    title: "Calculate Maximum Shear Force (Vmax)",
    explanation:
      "The shear force is constant at R1 from x = 0 to L/2, and then changes sign to R2. The absolute maximum shear force is $V_{max} = \\frac{P}{2}$.",
    latex: `V_{max} = \\frac{P}{2} = ${vMax}\\text{ kN}`,
  });

  return {
    domain: "Structural Mechanics",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${mMax} kN·m`,
      unit: "kN·m",
      latex: `M_{max} = ${mMax}\\text{ kN\\cdot m},\\quad V_{max} = ${vMax}\\text{ kN}`,
    },
  };
}

// -------------------------------------------------------------
// 10. Mechanical Solver: Heat Conduction
// -------------------------------------------------------------
export function solveHeatConduction(
  k: number,
  A: number,
  d_cm: number,
  T1: number,
  T2: number,
): Solution {
  const d_m = d_cm / 100;
  const given = [
    `Thermal Conductivity (k) = ${k} W/m·K`,
    `Wall Area (A) = ${A} m²`,
    `Wall Thickness (d) = ${d_cm} cm (${d_m} m)`,
    `Inside Temperature (T1) = ${T1} °C`,
    `Outside Temperature (T2) = ${T2} °C`,
  ];
  const find = ["Heat Flow Rate (Q)"];
  const assumptions = ["Steady-state 1D heat conduction", "Constant thermal conductivity"];
  const steps: Step[] = [];

  const tempDiff = T1 - T2;
  steps.push({
    title: "Calculate Temperature Difference (ΔT)",
    explanation: "Determine the temperature driving force across the brick wall thickness.",
    latex: `\\Delta T = T_1 - T_2 = ${T1} - ${T2} = ${tempDiff}^\\circ\\text{C}`,
  });

  const q = (k * A * tempDiff) / d_m;
  const qR = Number(q.toFixed(2));
  steps.push({
    title: "Apply Fourier's Law of Heat Conduction",
    explanation:
      "Fourier's Law states that heat flow rate Q is proportional to conductivity, area, and temperature gradient: $Q = \\frac{k \\cdot A \\cdot \\Delta T}{d}$.",
    latex: `Q = \\frac{${k} \\times ${A} \\times ${tempDiff}}{${d_m}} = ${qR}\\text{ W}`,
  });

  return {
    domain: "Thermodynamics / Heat Transfer",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${qR} W`,
      unit: "W",
      latex: `Q = ${qR}\\text{ W}`,
    },
  };
}

// -------------------------------------------------------------
// 11. Civil Solver: Active Earth Pressure
// -------------------------------------------------------------
export function solveEarthPressure(H: number, gamma: number, phi_deg: number): Solution {
  const given = [
    `Retaining Wall Height (H) = ${H} m`,
    `Soil Unit Weight (γ) = ${gamma} kN/m³`,
    `Friction Angle (φ) = ${phi_deg}°`,
  ];
  const find = ["Active Pressure Coefficient (Ka)", "Total Active Thrust (Pa)"];
  const assumptions = [
    "Rankine's earth pressure theory",
    "Dry cohesionless backfill",
    "Vertical smooth retaining wall",
  ];
  const steps: Step[] = [];

  const phi_rad = (phi_deg * Math.PI) / 180;
  const sinPhi = Math.sin(phi_rad);
  const ka = (1 - sinPhi) / (1 + sinPhi);
  const kaR = Number(ka.toFixed(4));
  steps.push({
    title: "Calculate Rankine's Active Pressure Coefficient (Ka)",
    explanation:
      "The coefficient Ka accounts for lateral soil expansion and is given by Rankine's formula: $K_a = \\frac{1 - \\sin\\phi}{1 + \\sin\\phi}$.",
    latex: `K_a = \\frac{1 - \\sin(${phi_deg}^\\circ)}{1 + \\sin(${phi_deg}^\\circ)} = \\frac{1 - ${sinPhi.toFixed(4)}}{1 + ${sinPhi.toFixed(4)}} = ${kaR}`,
  });

  const pa = 0.5 * ka * gamma * H * H;
  const paR = Number(pa.toFixed(2));
  steps.push({
    title: "Calculate Total Active Thrust (Pa)",
    explanation:
      "The total thrust represents the resultant of the triangular active earth pressure distribution: $P_a = \\frac{1}{2} K_a \\gamma H^2$.",
    latex: `P_a = \\frac{1}{2} \\times (${kaR}) \\times (${gamma}) \\times (${H})^2 = ${paR}\\text{ kN/m}`,
  });

  return {
    domain: "Geotechnical / Structural Engineering",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${paR} kN/m`,
      unit: "kN/m",
      latex: `K_a = ${kaR},\\quad P_a = ${paR}\\text{ kN/m}`,
    },
  };
}

// -------------------------------------------------------------
// 12. Civil Solver: Concrete Cylinder Strength
// -------------------------------------------------------------
export function solveConcreteStrength(P_kN: number, D_mm: number): Solution {
  const given = [`Failure Load (P) = ${P_kN} kN`, `Cylinder Diameter (D) = ${D_mm} mm`];
  const find = ["Cross-sectional Area (A)", "Compressive Strength (fc)"];
  const assumptions = [
    "Standard compressive test cylinder specimen",
    "Uniform compressive stress distribution",
  ];
  const steps: Step[] = [];

  const r_mm = D_mm / 2;
  const area_mm2 = Math.PI * r_mm * r_mm;
  const areaR = Number(area_mm2.toFixed(1));
  steps.push({
    title: "Calculate Cross-sectional Area (A)",
    explanation:
      "The cross-sectional area of a cylinder is computed using the formula $A = \\frac{\\pi D^2}{4}$.",
    latex: `A = \\frac{\\pi \\times (${D_mm})^2}{4} = ${areaR}\\text{ mm}^2`,
  });

  const load_N = P_kN * 1000;
  const stress_MPa = load_N / area_mm2;
  const stressR = Number(stress_MPa.toFixed(2));
  steps.push({
    title: "Calculate Compressive Strength (fc)",
    explanation:
      "Compressive strength is the failure load divided by cross-sectional area. Dividing Newtons by mm² gives Megapascals (MPa).",
    latex: `f_c = \\frac{P}{A} = \\frac{${load_N}\\text{ N}}{${areaR}\\text{ mm}^2} = ${stressR}\\text{ MPa}`,
  });

  return {
    domain: "Materials / Structural Engineering",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${stressR} MPa`,
      unit: "MPa",
      latex: `f_c = ${stressR}\\text{ MPa}`,
    },
  };
}

// -------------------------------------------------------------
// 13. Mathematics Solver: Matrix 2x2 Determinant
// -------------------------------------------------------------
export function solveMatrixDet2x2(a11: number, a12: number, a21: number, a22: number): Solution {
  const given = [`Matrix A = [[${a11}, ${a12}], [${a21}, ${a22}]]`];
  const find = ["Determinant of matrix A (det(A) or |A|)"];
  const assumptions = ["Square 2x2 matrix with real coefficients"];
  const steps: Step[] = [];

  steps.push({
    title: "Write the determinant formula",
    explanation:
      "For a 2x2 matrix A = [[a, b], [c, d]], the determinant is calculated as det(A) = ad - bc.",
    latex: `\\det(A) = \\begin{vmatrix} {a_{11}} & {a_{12}} \\\\ {a_{21}} & {a_{22}} \\end{vmatrix} = a_{11} a_{22} - a_{12} a_{21}`,
  });

  const term1 = a11 * a22;
  const term2 = a12 * a21;
  const det = term1 - term2;

  steps.push({
    title: "Substitute values and calculate terms",
    explanation: `Multiply diagonal elements: (${a11} × ${a22}) = ${term1}, and off-diagonal: (${a12} × ${a21}) = ${term2}.`,
    latex: `\\det(A) = (${a11})(${a22}) - (${a12})(${a21}) = ${term1} - (${term2})`,
  });

  steps.push({
    title: "Solve for the final determinant",
    explanation: "Perform the final subtraction to get the determinant.",
    latex: `\\det(A) = ${det}`,
  });

  return {
    domain: "Linear Algebra",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: String(det),
      unit: "",
      latex: `\\det(A) = ${det}`,
    },
  };
}

// -------------------------------------------------------------
// 14. Mathematics Solver: Vector Cross Product
// -------------------------------------------------------------
export function solveVectorCross(
  u1: number,
  u2: number,
  u3: number,
  v1: number,
  v2: number,
  v3: number,
): Solution {
  const given = [`Vector u = [${u1}, ${u2}, ${u3}]`, `Vector v = [${v1}, ${v2}, ${v3}]`];
  const find = ["Cross Product vector (u x v)"];
  const assumptions = ["Three-dimensional real Cartesian vectors"];
  const steps: Step[] = [];

  steps.push({
    title: "Write the cross product determinant matrix",
    explanation:
      "The cross product of vectors u and v is computed using the determinant of a 3x3 matrix with unit vectors i, j, k in the first row.",
    latex: `\\mathbf{u} \\times \\mathbf{v} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ ${u1} & ${u2} & ${u3} \\\\ ${v1} & ${v2} & ${v3} \\end{vmatrix}`,
  });

  const iPart = u2 * v3 - u3 * v2;
  const jPart = -(u1 * v3 - u3 * v1);
  const kPart = u1 * v2 - u2 * v1;

  steps.push({
    title: "Calculate components using 2x2 determinants",
    explanation:
      "Expand by the first row to get three 2x2 determinants representing the i, j, and k components.",
    latex: `\\mathbf{u} \\times \\mathbf{v} = \\mathbf{i}((${u2})(${v3}) - (${u3})(${v2})) - \\mathbf{j}((${u1})(${v3}) - (${u3})(${v1})) + \\mathbf{k}((${u1})(${v2}) - (${u2})(${v1}))`,
  });

  steps.push({
    title: "Resolve components",
    explanation: `Calculate: i = ${iPart}, j = ${jPart}, k = ${kPart}.`,
    latex: `\\mathbf{u} \\times \\mathbf{v} = (${iPart})\\mathbf{i} + (${jPart})\\mathbf{j} + (${kPart})\\mathbf{k}`,
  });

  return {
    domain: "Vector Algebra",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `[${iPart}, ${jPart}, ${kPart}]`,
      unit: "",
      latex: `\\mathbf{u} \\times \\mathbf{v} = \\left[${iPart},\\ ${jPart},\\ ${kPart}\\right]`,
    },
  };
}

// -------------------------------------------------------------
// 15. Physics Solver: Newton's Second Law & Friction
// -------------------------------------------------------------
export function solveNewtonFriction(m: number, a: number, mu: number): Solution {
  const g = 9.81;
  const given = [
    `Mass (m) = ${m} kg`,
    `Acceleration (a) = ${a} m/s²`,
    `Friction Coefficient (μ) = ${mu}`,
  ];
  const find = ["Normal Force (Fn)", "Frictional Force (Ff)", "Required Driving Force (F)"];
  const assumptions = [
    "Object on a flat horizontal surface",
    "Gravity is standard 9.81 m/s²",
    "Friction is kinetic",
  ];
  const steps: Step[] = [];

  const fn = m * g;
  const fnR = Number(fn.toFixed(2));
  steps.push({
    title: "Calculate Normal Force (Fn)",
    explanation: "On a flat surface, the normal force matches gravity: $F_n = m \\cdot g$.",
    latex: `F_n = ${m}\\text{ kg} \\times ${g}\\text{ m/s}^2 = ${fnR}\\text{ N}`,
  });

  const ff = mu * fn;
  const ffR = Number(ff.toFixed(2));
  steps.push({
    title: "Calculate Frictional Force (Ff)",
    explanation:
      "Friction opposing motion is calculated using the normal force: $F_f = \\mu \\cdot F_n$.",
    latex: `F_f = ${mu} \\times ${fnR}\\text{ N} = ${ffR}\\text{ N}`,
  });

  const fNet = m * a;
  const fNetR = Number(fNet.toFixed(2));
  steps.push({
    title: "Calculate Net Acceleration Force (Fnet)",
    explanation: "The force required just to accelerate the mass: $F_{net} = m \\cdot a$.",
    latex: `F_{net} = ${m}\\text{ kg} \\times ${a}\\text{ m/s}^2 = ${fNetR}\\text{ N}`,
  });

  const fTotal = fNet + ff;
  const fTotalR = Number(fTotal.toFixed(2));
  steps.push({
    title: "Calculate Total Required Driving Force (F)",
    explanation:
      "The total force must overcome friction and provide the desired acceleration: $F = F_{net} + F_f$.",
    latex: `F = ${fNetR}\\text{ N} + ${ffR}\\text{ N} = ${fTotalR}\\text{ N}`,
  });

  return {
    domain: "Dynamics / Mechanics",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${fTotalR} N`,
      unit: "N",
      latex: `F = ${fTotalR}\\text{ N},\\quad F_f = ${ffR}\\text{ N}`,
    },
  };
}

// -------------------------------------------------------------
// 16. Physics Solver: Centripetal Force
// -------------------------------------------------------------
export function solveCentripetal(m: number, v: number, r: number): Solution {
  const given = [`Mass (m) = ${m} kg`, `Velocity (v) = ${v} m/s`, `Radius (r) = ${r} m`];
  const find = ["Centripetal Acceleration (ac)", "Centripetal Force (Fc)"];
  const assumptions = ["Uniform circular motion", "No gravitational tilt/bank angle"];
  const steps: Step[] = [];

  const ac = (v * v) / r;
  const acR = Number(ac.toFixed(3));
  steps.push({
    title: "Calculate Centripetal Acceleration (ac)",
    explanation:
      "Centripetal acceleration is velocity squared divided by radius: $a_c = \\frac{v^2}{r}$.",
    latex: `a_c = \\frac{(${v})^2}{${r}} = \\frac{${v * v}}{${r}} = ${acR}\\text{ m/s}^2`,
  });

  const fc = m * ac;
  const fcR = Number(fc.toFixed(2));
  steps.push({
    title: "Calculate Centripetal Force (Fc)",
    explanation: "Substitute acceleration into Newton's second law: $F_c = m \\cdot a_c$.",
    latex: `F_c = ${m}\\text{ kg} \\times ${acR}\\text{ m/s}^2 = ${fcR}\\text{ N}`,
  });

  return {
    domain: "Dynamics / Circular Motion",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${fcR} N`,
      unit: "N",
      latex: `F_c = ${fcR}\\text{ N},\\quad a_c = ${acR}\\text{ m/s}^2`,
    },
  };
}

// -------------------------------------------------------------
// 17. Electronics Solver: Voltage Divider
// -------------------------------------------------------------
export function solveVoltageDivider(vIn: number, r1: number, r2: number): Solution {
  const given = [
    `Input Voltage (Vin) = ${vIn} V`,
    `Resistor 1 (R1) = ${r1} Ω`,
    `Resistor 2 (R2) = ${r2} Ω`,
  ];
  const find = ["Output Voltage (Vout) across R2"];
  const assumptions = ["Unloaded voltage divider circuit (infinite load resistance)"];
  const steps: Step[] = [];

  const rTotal = r1 + r2;
  steps.push({
    title: "Calculate Total Resistance (Rtotal)",
    explanation:
      "Since R1 and R2 are in series, their total resistance is the direct sum: $R_{total} = R_1 + R_2$.",
    latex: `R_{total} = ${r1}\\ \\Omega + ${r2}\\ \\Omega = ${rTotal}\\ \\Omega`,
  });

  const vOut = (vIn * r2) / rTotal;
  const vOutR = Number(vOut.toFixed(3));
  steps.push({
    title: "Apply the Voltage Divider formula",
    explanation:
      "Output voltage is the ratio of R2 to total resistance multiplied by input voltage: $V_{out} = V_{in} \\cdot \\frac{R_2}{R_1 + R_2}$.",
    latex: `V_{out} = ${vIn}\\text{ V} \\times \\frac{${r2}\\ \\Omega}{${rTotal}\\ \\Omega} = ${vOutR}\\text{ V}`,
  });

  return {
    domain: "Circuit Analysis",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${vOutR} V`,
      unit: "V",
      latex: `V_{out} = ${vOutR}\\text{ V}`,
    },
  };
}

// -------------------------------------------------------------
// 18. Electronics Solver: Transformer
// -------------------------------------------------------------
export function solveTransformer(vP: number, nP: number, nS: number): Solution {
  const given = [
    `Primary Voltage (Vp) = ${vP} V`,
    `Primary Turns (Np) = ${nP}`,
    `Secondary Turns (Ns) = ${nS}`,
  ];
  const find = ["Secondary Voltage (Vs)", "Turns Ratio (N)"];
  const assumptions = ["Ideal transformer without core losses or leakage flux"];
  const steps: Step[] = [];

  const ratio = nS / nP;
  const ratioR = Number(ratio.toFixed(4));
  steps.push({
    title: "Calculate Turns Ratio (Ns / Np)",
    explanation: "Determine the step-up or step-down factor: $N = \\frac{N_s}{N_p}$.",
    latex: `N = \\frac{${nS}}{${nP}} = ${ratioR}`,
  });

  const vS = vP * ratio;
  const vSR = Number(vS.toFixed(3));
  steps.push({
    title: "Calculate Secondary Voltage (Vs)",
    explanation:
      "Secondary voltage is proportional to the turns ratio: $V_s = V_p \\cdot \\frac{N_s}{N_p}$.",
    latex: `V_s = ${vP}\\text{ V} \\times ${ratioR} = ${vSR}\\text{ V}`,
  });

  return {
    domain: "Power Systems / Magnetics",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${vSR} V`,
      unit: "V",
      latex: `V_s = ${vSR}\\text{ V},\\quad \\text{Ratio} = ${ratioR}`,
    },
  };
}

// -------------------------------------------------------------
// 19. Mechanical Solver: Hydrostatic Pressure
// -------------------------------------------------------------
export function solveHydrostatic(rho: number, h: number): Solution {
  const g = 9.81;
  const given = [`Fluid Density (ρ) = ${rho} kg/m³`, `Fluid Height/Depth (h) = ${h} m`];
  const find = ["Hydrostatic Pressure (P)"];
  const assumptions = [
    "Incompressible fluid in static equilibrium",
    "Standard gravity g = 9.81 m/s²",
  ];
  const steps: Step[] = [];

  const pressure = rho * g * h;
  const pressurePa = Number(pressure.toFixed(1));
  const pressureKPa = Number((pressure / 1000).toFixed(3));

  steps.push({
    title: "Apply Hydrostatic Pressure formula",
    explanation:
      "Pressure at depth h is density times gravity times depth: $P = \\rho \\cdot g \\cdot h$.",
    latex: `P = (${rho}\\text{ kg/m}^3) \\times (${g}\\text{ m/s}^2) \\times (${h}\\text{ m})`,
  });

  steps.push({
    title: "Calculate Pressure",
    explanation: `Multiply terms to obtain pressure in Pascals: ${pressurePa} Pa. Divide by 1000 for kilopascals (kPa).`,
    latex: `P = ${pressurePa}\\text{ Pa} = ${pressureKPa}\\text{ kPa}`,
  });

  return {
    domain: "Fluid Mechanics",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${pressureKPa} kPa`,
      unit: "kPa",
      latex: `P = ${pressureKPa}\\text{ kPa}`,
    },
  };
}

// -------------------------------------------------------------
// 20. Mechanical Solver: Gear Ratio
// -------------------------------------------------------------
export function solveGearRatio(t1: number, t2: number, n1: number): Solution {
  const given = [
    `Driver Teeth (T1) = ${t1}`,
    `Driven Teeth (T2) = ${t2}`,
    `Driver Speed (N1) = ${n1} RPM`,
  ];
  const find = ["Gear Ratio (GR)", "Driven Speed (N2)"];
  const assumptions = ["Rigid gears without teeth slip", "Uniform angular velocities"];
  const steps: Step[] = [];

  const gr = t2 / t1;
  const grR = Number(gr.toFixed(3));
  steps.push({
    title: "Calculate Gear Ratio (GR)",
    explanation:
      "Gear ratio is the ratio of driven gear teeth to driver gear teeth: $GR = \\frac{T_2}{T_1}$.",
    latex: `GR = \\frac{${t2}}{${t1}} = ${grR}`,
  });

  const n2 = n1 / gr;
  const n2R = Number(n2.toFixed(1));
  steps.push({
    title: "Calculate Output Driven Speed (N2)",
    explanation:
      "Driven gear speed is driver speed divided by gear ratio: $N_2 = \\frac{N_1}{GR} = N_1 \\cdot \\frac{T_1}{T_2}$.",
    latex: `N_2 = \\frac{${n1}\\text{ RPM}}{${grR}} = ${n2R}\\text{ RPM}`,
  });

  return {
    domain: "Machine Dynamics / Kinematics",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${n2R} RPM`,
      unit: "RPM",
      latex: `N_2 = ${n2R}\\text{ RPM},\\quad \\text{Ratio} = ${grR}:1`,
    },
  };
}

// -------------------------------------------------------------
// 21. Civil Solver: Euler Column Buckling
// -------------------------------------------------------------
export function solveEulerBuckling(E: number, I: number, L: number, K: number): Solution {
  const given = [
    `Elastic Modulus (E) = ${E} GPa`,
    `Area Moment of Inertia (I) = ${I} cm⁴`,
    `Column Length (L) = ${L} m`,
    `Effective Length Factor (K) = ${K}`,
  ];
  const find = ["Effective Length (Le)", "Critical Buckling Load (Pcr)"];
  const assumptions = [
    "Euler-Bernoulli column theory",
    "Perfectly straight pinned/fixed column",
    "Linear elastic isotropic material",
  ];
  const steps: Step[] = [];

  const lEff = K * L;
  steps.push({
    title: "Calculate Effective Length (Le)",
    explanation: "Effective length accounts for boundary constraints: $L_e = K \\cdot L$.",
    latex: `L_e = ${K} \\times ${L}\\text{ m} = ${lEff}\\text{ m}`,
  });

  // Convert E to Pa (GPa * 1e9), I to m4 (cm4 * 1e-8)
  const ePa = E * 1e9;
  const iM4 = I * 1e-8;
  const pCr = (Math.PI * Math.PI * ePa * iM4) / (lEff * lEff);
  const pCrKN = Number((pCr / 1000).toFixed(2));

  steps.push({
    title: "Apply Euler's Buckling formula",
    explanation: "Euler's critical buckling load formula is: $P_{cr} = \\frac{\\pi^2 E I}{L_e^2}$.",
    latex: `P_{cr} = \\frac{\\pi^2 \\times (${E} \\times 10^9) \\times (${I} \\times 10^{-8})}{(${lEff})^2}`,
  });

  steps.push({
    title: "Solve for Critical Buckling Load (Pcr)",
    explanation: `Calculate critical load in Newtons, and divide by 1000 to express in kilonewtons (kN): ${pCrKN} kN.`,
    latex: `P_{cr} = ${pCrKN}\\text{ kN}`,
  });

  return {
    domain: "Structural Engineering / Column Design",
    given,
    find,
    assumptions,
    steps,
    final: {
      value: `${pCrKN} kN`,
      unit: "kN",
      latex: `P_{cr} = ${pCrKN}\\text{ kN}`,
    },
  };
}
