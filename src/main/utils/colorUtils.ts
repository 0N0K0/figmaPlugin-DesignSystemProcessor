/**
 * Utilitaires de conversion de couleurs pour Figma
 */

import { converter } from "culori";

/**
 * Convertit une couleur hexadécimale en objet RGBA Figma
 */
export function hexToFigmaRgba(hex: string, alpha: number = 1): RGBA {
  const rgb = converter("rgb")(hex);

  if (!rgb) {
    throw new Error(`Format de couleur invalide: ${hex}`);
  }

  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    a: alpha,
  };
}
