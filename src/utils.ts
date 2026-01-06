import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';
import { OUTPUT_DIR } from './constants';
import { FigmaCollection, FigmaColorValue, FigmaVariable } from './types';

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
  variables: FigmaVariable[] | Record<string, FigmaVariable>
): string {
  const modeData: Record<string, any>  = variables;

  // Ajouter les extensions du mode
  modeData.$extensions = {
    'com.figma.modeName': name,
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
  collection.modes.forEach(mode => {
    const filename = `${sanitizeFilename(mode)}.tokens.json`;
    zip.file(filename, collection.variables[mode]);
  });

  // Générer le ZIP
  const content = await zip.generateAsync({ type: 'nodebuffer' });
  
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
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Génère une variable Figma
 */
export function generateVariable(
    type: "number" | "string" | "boolean" | "color",
    value: number | string | boolean | FigmaColorValue,
    scopes: string[],
    hiddenFromPublishing: boolean = false,
) : FigmaVariable {
    let variable : FigmaVariable = {
        $type: type === 'boolean' ? 'number' : type,
        $value: typeof value === 'boolean' ? (value ? 1 : 0) : value as number | string | FigmaColorValue,
        $extensions: {
            'com.figma.scopes': scopes,
        }
    };
    if (type === 'boolean' || type === 'string') {
        variable.$extensions['com.figma.type'] = type;
    }
    if (hiddenFromPublishing) {
        variable.$extensions['com.figma.hiddenFromPublishing'] = true;
    }
    return variable;
}

/**
 * Convertit une couleur RGBA en format hexadécimal
 */
export function rgbaToHex(r: number, g: number, b: number, a: number = 1): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
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
export function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  // Retirer le # si présent
  hex = hex.replace(/^#/, '');
  
  // Gérer les formats courts (#RGB)
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
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
function formatColorValue(color: any): any {
  // Si c'est un objet RGBA
  if (typeof color === 'object' && 'r' in color) {
    const { r, g, b, a = 1 } = color;
    return {
      colorSpace: 'srgb',
      components: [r, g, b],
      alpha: a,
      hex: rgbaToHex(r, g, b, a),
    };
  }
  
  // Si c'est une chaîne hexadécimale
  if (typeof color === 'string' && color.match(/^#?[0-9A-Fa-f]{3,8}$/)) {
    const { r, g, b, a } = hexToRgba(color);
    return {
      colorSpace: 'srgb',
      components: [r, g, b],
      alpha: a,
      hex: color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`,
    };
  }
  
  return color;
}
