import * as fs from 'fs';
import * as path from 'path';
import JSZip from 'jszip';
import { OUTPUT_DIR } from './constants';
import { FigmaCollection } from './types';

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
  collection: FigmaCollection,
  modeId: string
): string {
  const mode = collection.modes.find(m => m.modeId === modeId);
  if (!mode) {
    throw new Error(`Mode ${modeId} not found in collection ${collection.name}`);
  }

  const modeData: Record<string, any> = {};

  // Fonction récursive pour traiter les variables et les groupes
  function processVariables(variables: any, target: Record<string, any>) {
    if (Array.isArray(variables)) {
      // C'est un tableau de variables
      variables.forEach(variable => {
        const rawValue = variable.values[modeId];
        if (rawValue === undefined) return;

        target[variable.name] = formatVariable(variable, rawValue);
      });
    } else {
      // C'est un objet avec des groupes
      Object.keys(variables).forEach(key => {
        const value = variables[key];
        
        if (Array.isArray(value)) {
          // C'est un groupe de variables
          if (value.length > 0 && 'values' in value[0]) {
            // Ce sont des variables Figma
            target[key] = {};
            value.forEach(variable => {
              const rawValue = variable.values[modeId];
              if (rawValue !== undefined) {
                target[key][variable.name] = formatVariable(variable, rawValue);
              }
            });
          }
        } else if (typeof value === 'object') {
          // C'est un sous-groupe, traiter récursivement
          target[key] = {};
          processVariables(value, target[key]);
        }
      });
    }
  }

  function formatVariable(variable: any, rawValue: any) {
    const extensions: Record<string, any> = {
      'com.figma.scopes': variable.scopes,
    };

    if (variable.hiddenFromPublishing) {
      extensions['com.figma.hiddenFromPublishing'] = true;
    }

    let $type: string;
    let $value: any;

    switch (variable.type) {
      case 'color':
        $type = 'color';
        $value = formatColorValue(rawValue);
        break;
      case 'boolean':
        $type = 'number';
        $value = rawValue ? 1 : 0;
        extensions['com.figma.type'] = 'boolean';
        break;
      case 'string':
        $type = 'string';
        $value = rawValue;
        extensions['com.figma.type'] = 'string';
        break;
      case 'number':
      default:
        $type = 'number';
        $value = rawValue;
        break;
    }

    return {
      $type,
      $value,
      $extensions: extensions,
    };
  }

  processVariables(collection.variables, modeData);

  // Ajouter les extensions du mode
  modeData.$extensions = {
    'com.figma.modeName': mode.name,
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
    const jsonContent = generateModeJson(collection, mode.modeId);
    const filename = `${sanitizeFilename(mode.name)}.json`;
    zip.file(filename, jsonContent);
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
