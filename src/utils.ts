import * as fs from "fs";
import * as path from "path";
import JSZip from "jszip";
import { OUTPUT_DIR } from "./constants";
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
  name: string,
  variables: FigmaVariable[] | Record<string, any>
): string {
  const modeData: Record<string, any> = variables;

  // Ajouter les extensions du mode
  modeData.$extensions = {
    "com.figma.modeName": name,
  };

  return JSON.stringify(modeData, null, 2);
}

/**
 * Crée un fichier ZIP contenant tous les JSON pour une collection
 */
export async function createZipForCollection(
  collection: FigmaCollection,
  outputFilename?: string
): Promise<string> {
  const zip = new JSZip();

  // Générer un JSON par mode
  collection.modes.forEach((mode) => {
    const filename = `${sanitizeFilename(mode)}.tokens.json`;
    zip.file(filename, collection.variables[mode]);
  });

  // Générer le ZIP
  const content = await zip.generateAsync({ type: "nodebuffer" });

  ensureOutputDir();

  const filename = outputFilename || `${sanitizeFilename(collection.name)}.zip`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  fs.writeFileSync(outputPath, content);

  return outputPath;
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
export function hslaToRgba(
  h: number,
  s: number,
  l: number,
  a: number
): [number, number, number, number] {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const chroma = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const color =
      l - chroma * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
    return Math.round(255 * color);
  };
  return [f(0), f(8), f(4), a];
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
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  if (a < 1) {
    return `${hex}${toHex(a)}`;
  }

  return hex;
}

/**
 * Convertit une couleur hexadécimale en format RGBA
 */
export function hexToRgba(hex: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  // Retirer le # si présent
  hex = hex.replace(/^#/, "");

  // Gérer les formats courts (#RGB)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Extraire les composants
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

  return { r, g, b, a };
}

/**
 * Formate une valeur de couleur au format Figma
 */
export function formatColorValue(color: any): any {
  // Si c'est un objet HSL
  if (typeof color === "object" && "h" in color) {
    const { h, s, l, a } = color;
    const [r, g, b, alpha] = hslaToRgba(h, s, l, a);
    return {
      colorSpace: "srgb",
      components: [r / 255, g / 255, b / 255],
      alpha: a !== undefined ? a : 1,
      hex: rgbaToHex(r, g, b, a !== undefined ? a : 1),
    };
  }

  // Si c'est un objet RGBA
  if (typeof color === "object" && "r" in color) {
    const { r, g, b, a } = color;
    return {
      colorSpace: "srgb",
      components: [r, g, b],
      alpha: a,
      hex: rgbaToHex(r, g, b, a),
    };
  }

  // Si c'est une chaîne hexadécimale
  if (typeof color === "string" && color.match(/^#?[0-9A-Fa-f]{3,8}$/)) {
    const { r, g, b, a } = hexToRgba(color);
    return {
      colorSpace: "srgb",
      components: [r, g, b],
      alpha: a,
      hex: color.startsWith("#")
        ? color.toUpperCase()
        : `#${color.toUpperCase()}`,
    };
  }

  return color;
}
