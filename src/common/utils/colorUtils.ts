import { clampChroma, converter, formatHex, wcagContrast } from "culori";
import { SHADE_STEPS } from "../constants/colorConstants";

export function generateShades(
  colorHex: string
): { step: number; color: string }[] {
  const base = converter("oklch")(colorHex);
  if (!base) return [];
  const { l: baseL, c: CO, h: H0 } = base;
  const lMax = 0.95;
  const lMin = 0.15;
  const stepNumbers = SHADE_STEPS.map(Number);
  const minStep = Math.min.apply(Math, stepNumbers);
  const maxStep = Math.max.apply(Math, stepNumbers);

  // Trouve la shade la plus proche de la luminosité de base
  let closestStep = SHADE_STEPS[0];
  let minDiff = Infinity;

  SHADE_STEPS.forEach((step) => {
    const t = (step - minStep) / (maxStep - minStep);
    const l = lMax - Math.pow(t, 1.15) * (lMax - lMin);
    const diff = Math.abs(l - baseL);
    if (diff < minDiff) {
      minDiff = diff;
      closestStep = step;
    }
  });

  return SHADE_STEPS.map((step) => {
    // Si c'est la shade la plus proche, on utilise la couleur de départ
    if (step === closestStep) {
      return { step, color: colorHex };
    }

    const stepValue = step;
    const t = (stepValue - minStep) / (maxStep - minStep);
    const l = lMax - Math.pow(t, 1.15) * (lMax - lMin);
    const c = CO * Math.pow(Math.sin(Math.PI * t), 0.9);
    const color = clampChroma({ mode: "oklch", l, c, h: H0 });
    return { step, color: formatHex(color) };
  });
}

export function generateGreyShades(
  steps: number[],
  hue: number = 0
): Record<string, string> {
  const greyShades: Record<string, string> = {};
  for (const step of steps) {
    const t = step / 1000;
    const lightness = 1 - t * 1;
    greyShades[step] = formatHex({
      mode: "hsl",
      h: hue,
      s: hue ? 0.05 : 0,
      l: lightness,
      alpha: 1,
    });
  }
  return greyShades;
}

export function getContrastColor(
  bgHex: string,
  lightHex: string,
  darkHex: string
): string {
  const contrastWithLight = wcagContrast(bgHex, lightHex);
  const contrastWithDark = wcagContrast(bgHex, darkHex);
  return contrastWithLight >= contrastWithDark ? lightHex : darkHex;
}
