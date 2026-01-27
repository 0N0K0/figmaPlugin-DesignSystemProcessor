import { logger } from "./logger";

export function angleToTransform(deg: number): number[][] {
  try {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
      [cos, sin, 0],
      [-sin, cos, 0],
    ];
  } catch (error) {
    logger.error(
      "[angleToTransform] Erreur lors de la conversion de l'angle en transformation:",
      error,
    );
    throw error;
  }
}

function generateCombinationsRecursive<T>(
  array: T[],
  comboLength: number,
  start: number,
  combo: T[],
  results: T[][],
) {
  try {
    if (combo.length === comboLength) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      generateCombinationsRecursive(array, comboLength, i + 1, combo, results);
      combo.pop();
    }
  } catch (error) {
    logger.error(
      "[generateCombinationsRecursive] Erreur lors de la génération récursive des combinaisons :",
      error,
    );
    throw error;
  }
}

export function getCombinations<T>(array: T[], comboLength: number): T[][] {
  try {
    const results: T[][] = [];
    generateCombinationsRecursive(array, comboLength, 0, [], results);
    return results;
  } catch (error) {
    logger.error(
      "[getCombinations] Erreur lors de la génération des combinaisons :",
      error,
    );
    throw error;
  }
}
