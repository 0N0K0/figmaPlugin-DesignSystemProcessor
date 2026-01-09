import fs from "fs";
import path from "path";
import JSZip from "jszip";
import {
  converter,
  hsl,
  rgb,
  formatHex,
  clampChroma,
  Rgb,
  wcagContrast,
} from "culori";
import { COLOR_STEPS, COLORS, OUTPUT_DIR, SCOPES } from "./constants";
import { FigmaCollection, FigmaColorValue, FigmaVariable } from "./types";

/**
 * Crée le dossier de sortie s'il n'existe pas
 */
export function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Génère un fichier JSON pour un mode spécifique d'une collection
 */
export function generateModeJson(
  collectionName: string,
  modeName: string,
  variables: FigmaVariable[] | Record<string, any>
): string {
  const modeData: Record<string, any> = variables;

  // Ajouter les extensions du mode
  modeData.$extensions = {
    "com.figma.modeName": modeName,
    "com.figma.collectionName": collectionName,
  };

  return JSON.stringify(modeData, null, 2);
}

/**
 * Crée un dossier contenant tous les JSON pour une collection
 */
export async function createDirForCollection(collection: FigmaCollection) {
  ensureOutputDir();

  const collectionDir = path.join(OUTPUT_DIR, collection.name);
  if (!fs.existsSync(collectionDir)) {
    fs.mkdirSync(collectionDir, { recursive: true });
  }
  // Générer un JSON par mode
  collection.modes.forEach((mode) => {
    const filePath = path.join(
      collectionDir,
      `${sanitizeFilename(mode)}.tokens.json`
    );
    const data = collection.variables[mode];
    if (data === undefined) {
      console.warn(
        `Aucune donnée pour le mode "${mode}" dans la collection "${collection.name}"`
      );
      return;
    }
    fs.writeFileSync(filePath, data, "utf-8");
  });
}

/**
 * Nettoie un nom de fichier en retirant les caractères invalides
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-z0-9_-]/gi, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

/**
 * Génère une variable Figma
 */
export function generateVariable(
  type: "number" | "string" | "boolean" | "color",
  value: number | string | boolean | FigmaColorValue,
  scopes?: string[],
  hiddenFromPublishing: boolean = false,
  targetVariableName?: string,
  targetVariableSetName?: string
): FigmaVariable {
  let variable: FigmaVariable = {
    $type: type === "boolean" ? "number" : type,
    $value:
      typeof value === "boolean"
        ? value
          ? 1
          : 0
        : (value as number | string | FigmaColorValue),
  };
  if (scopes) {
    if (!variable.$extensions) variable.$extensions = {};
    variable.$extensions["com.figma.scopes"] = scopes;
  }
  if (type === "boolean" || type === "string") {
    if (!variable.$extensions) variable.$extensions = {};
    variable.$extensions["com.figma.type"] = type;
  }
  if (hiddenFromPublishing) {
    if (!variable.$extensions) variable.$extensions = {};
    variable.$extensions["com.figma.hiddenFromPublishing"] = true;
  }
  if (targetVariableName && targetVariableSetName) {
    if (!variable.$extensions) variable.$extensions = {};
    variable.$extensions["com.figma.aliasdata"] = {
      targetVariableName: targetVariableName,
      targetVariableSetName: targetVariableSetName,
    };
  }
  return variable;
}

/**
 * Convertit une couleur HSLA en RGBA
 */
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

/**
 * Convertit une couleur HSLA en format hexadécimal
 */
export function hslaToHex(h: number, s: number, l: number, a: number): string {
  const color = hsl({ mode: "hsl", h, s: s, l: l, alpha: a });
  return formatHex(color);
}

/**
 * Convertit une couleur RGBA en format hexadécimal
 */
export function rgbaToHex(
  r: number,
  g: number,
  b: number,
  a: number = 1
): string {
  const color = rgb({
    mode: "rgb",
    r: r,
    g: g,
    b: b,
    alpha: a,
  });
  return formatHex(color);
}

/**
 * Convertit une couleur hexadécimale en format RGBA
 */
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

/**
 * Formate une valeur de couleur au format Figma
 */
export function formatColorValue(color: any): FigmaColorValue {
  // Si c'est un objet HSL
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

  // Si c'est un objet RGBA
  if (typeof color === "object" && "r" in color) {
    const { r, g, b, alpha } = color;
    return {
      colorSpace: "srgb",
      components: [r, g, b],
      alpha: alpha !== undefined ? alpha : 1,
      hex: rgbaToHex(r, g, b, alpha),
    };
  }

  // Si c'est une chaîne hexadécimale
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
  // Convertir la couleur de base en OKLCH
  const base = converter("oklch")(colorHex);
  if (!base) return [];
  const { c: CO, h: H0 } = base;

  // Générer les nuances
  const lMax = 0.95;
  const lMin = 0.15;

  // Interpolation sur la valeur réelle du step
  const stepNumbers = COLOR_STEPS.map(Number);
  const minStep = Math.min(...stepNumbers);
  const maxStep = Math.max(...stepNumbers);

  return COLOR_STEPS.map((step) => {
    const stepValue = parseInt(step); // Convertir en nombre
    const t = (stepValue - minStep) / (maxStep - minStep); // Normaliser entre 0 et 1
    const l = lMax - Math.pow(t, 1.15) * (lMax - lMin); // Ajuster la courbe de luminosité
    const c = CO * Math.pow(Math.sin(Math.PI * t), 0.9);
    const color = clampChroma({ mode: "oklch", l, c, h: H0 }); // Clamper la chroma
    const rgb = converter("rgb")(color);
    return { step, color: converter("rgb")(color) }; // Convertir en RGB
  });
}

export function generateGreyShades() {
  const greyShades: Record<
    string,
    { mode: "hsl"; h: number | undefined; s: number; l: number }
  > = {};
  // Générer les nuances de gris
  greyShades["0"] = {
    mode: "hsl",
    h: 0,
    s: 0,
    l: 100,
  };
  for (const step of COLOR_STEPS) {
    const lightness = 100 - parseInt(step) / 10;
    const shadeColor = { mode: "hsl" as const, h: 0, s: 0, l: lightness };
    greyShades[step] = shadeColor;
  }
  greyShades["1000"] = {
    mode: "hsl",
    h: 0,
    s: 0,
    l: 0,
  };
  return greyShades;
}

export function getContrastColor(
  bgHex: string,
  lightShade: {
    mode: "hsl";
    h: number | undefined;
    s: number;
    l: number;
  },
  darkShade: {
    mode: "hsl";
    h: number | undefined;
    s: number;
    l: number;
  }
): string {
  const light = formatColorValue(lightShade).hex;
  const dark = formatColorValue(darkShade).hex;
  const contrastWithLight = wcagContrast(bgHex, light);
  const contrastWithDark = wcagContrast(bgHex, dark);
  return contrastWithLight >= contrastWithDark ? light : dark;
}
