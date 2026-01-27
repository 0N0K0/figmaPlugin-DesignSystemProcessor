import { converter } from "culori";
import { logger } from "./logger";

/**
 * Convertit une couleur hexadécimale en objet RGBA Figma
 */
export async function hexToFigmaRgba(
  hex: string,
  alpha: number = 1,
): Promise<RGBA> {
  try {
    const rgb = converter("rgb")(hex);

    if (!rgb) {
      await logger.error(`[hexToFigmaRgba] Format de couleur invalide: ${hex}`);
      throw new Error(`Format de couleur invalide: ${hex}`);
    }
    const figmaRgba = {
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      a: alpha,
    };
    return figmaRgba;
  } catch (error) {
    await logger.error(
      "[hexToFigmaRgba] Erreur de conversion de couleur hex en RGBA Figma:",
      error,
    );
    throw error;
  }
}
