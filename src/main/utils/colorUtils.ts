import { converter } from "culori";
import { logger } from "./logger";

/**
 * Convertit une couleur hexadécimale en objet RGBA Figma
 */
export function hexToFigmaRgba(hex: string, alpha: number = 1): RGBA {
  try {
    const rgb = converter("rgb")(hex);

    if (!rgb) {
      logger.error(`[hexToFigmaRgba] Format de couleur invalide: ${hex}`);
      throw new Error(`Format de couleur invalide: ${hex}`);
    }
    const figmaRgba = {
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      a: alpha,
    };
    logger.success(
      `[hexToFigmaRgba] Couleur hex '${hex}' convertie en RGBA Figma:`,
      figmaRgba,
    );
    return figmaRgba;
  } catch (error) {
    logger.error(
      "[hexToFigmaRgba] Erreur de conversion de couleur hex en RGBA Figma:",
      error,
    );
    throw error;
  }
}
