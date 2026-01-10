import {
  converter,
  hsl,
  rgb,
  formatHex,
  clampChroma,
  Rgb,
  wcagContrast,
} from "culori";
import { COLOR_STEPS } from "../constants";
import { FigmaColorValue } from "../types";

export function hslaToRgba(h: number, s: number, l: number, a: number): Rgb {
  const color = hsl({ mode: "hsl", h, s: s, l: l, alpha: a });
  const rgbColor = converter("rgb")(color);
  return {
    mode: "rgb",
    r: Math.round((rgbColor.r ?? 0) * 255),
    g: Math.round((rgbColor.g ?? 0) * 255),
    b: Math.round((rgbColor.b ?? 0) * 255),
    alpha: rgbColor.alpha ?? 1,
  };
}

export function hslaToHex(h: number, s: number, l: number, a: number): string {
  const color = hsl({ mode: "hsl", h, s: s, l: l, alpha: a });
  return formatHex(color);
}

export function rgbaToHex(
  r: number,
  g: number,
  b: number,
  a: number = 1
): string {
  const color = rgb({ mode: "rgb", r: r, g: g, b: b, alpha: a });
  return formatHex(color);
}

export function hexToRgba(hex: string): Rgb {
  const rgbColor = converter("rgb")(hex);
  if (!rgbColor) return { mode: "rgb", r: 0, g: 0, b: 0, alpha: 1 };
  return {
    mode: "rgb",
    r: Math.round((rgbColor.r ?? 0) * 255),
    g: Math.round((rgbColor.g ?? 0) * 255),
    b: Math.round((rgbColor.b ?? 0) * 255),
    alpha: rgbColor.alpha ?? 1,
  };
}

export function formatColorValue(color: any): FigmaColorValue {
  if (typeof color === "object" && "h" in color) {
    const { h, s, l, alpha: HSLa } = color;
    const { r, g, b, alpha: RGBa } = hslaToRgba(h, s / 100, l / 100, HSLa);
    return {
      colorSpace: "srgb",
      components: [r / 255, g / 255, b / 255],
      alpha: HSLa !== undefined ? HSLa : 1,
      hex: hslaToHex(h, s / 100, l / 100, HSLa),
    };
  }
  if (typeof color === "object" && "r" in color) {
    const { r, g, b, alpha } = color;
    return {
      colorSpace: "srgb",
      components: [r, g, b],
      alpha: alpha !== undefined ? alpha : 1,
      hex: rgbaToHex(r, g, b, alpha),
    };
  }
  if (typeof color === "string" && color.match(/^#?[0-9A-Fa-f]{3,8}$/)) {
    const { r, g, b, alpha } = hexToRgba(color);
    return {
      colorSpace: "srgb",
      components: [r / 255, g / 255, b / 255],
      alpha: alpha !== undefined ? alpha : 1,
      hex: color.startsWith("#")
        ? color.toUpperCase()
        : `#${color.toUpperCase()}`,
    };
  }
  return color;
}

export function generateShades(
  colorHex: string
): { step: string; color: Rgb }[] {
  const base = converter("oklch")(colorHex);
  if (!base) return [];
  const { c: CO, h: H0 } = base;
  const lMax = 0.95;
  const lMin = 0.15;
  const stepNumbers = COLOR_STEPS.map(Number);
  const minStep = Math.min(...stepNumbers);
  const maxStep = Math.max(...stepNumbers);
  return COLOR_STEPS.map((step) => {
    const stepValue = parseInt(step);
    const t = (stepValue - minStep) / (maxStep - minStep);
    const l = lMax - Math.pow(t, 1.15) * (lMax - lMin);
    const c = CO * Math.pow(Math.sin(Math.PI * t), 0.9);
    const color = clampChroma({ mode: "oklch", l, c, h: H0 });
    return { step, color: converter("rgb")(color) };
  });
}

export function generateGreyShades(steps: string[]): Record<string, Rgb> {
  const greyShades: Record<string, Rgb> = {};
  for (const step of steps) {
    const t = parseInt(step) / 1000;
    const lightness = 1 - t * 1;
    greyShades[step] = hslaToRgba(0, 0, lightness, 1);
  }
  greyShades["0"] = hslaToRgba(0, 0, 1, 1);
  greyShades["1000"] = hslaToRgba(0, 0, 0, 1);
  return greyShades;
}

export function getContrastColor(
  bgHex: string,
  lightShade: Rgb,
  darkShade: Rgb
): string {
  const light = rgbaToHex(
    lightShade.r / 255,
    lightShade.g / 255,
    lightShade.b / 255
  );
  const dark = rgbaToHex(
    darkShade.r / 255,
    darkShade.g / 255,
    darkShade.b / 255
  );
  const contrastWithLight = wcagContrast(bgHex, light);
  const contrastWithDark = wcagContrast(bgHex, dark);
  return contrastWithLight >= contrastWithDark ? light : dark;
}
