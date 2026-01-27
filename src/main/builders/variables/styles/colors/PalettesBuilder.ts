/**
 * Génère les palettes de couleurs et crée les variables Figma
 */

import {
  generateGreyShades,
  generateShades,
} from "../../../../../common/utils/colorUtils";
import { variableBuilder } from "../../variableBuilder";
import { SCOPES } from "../../../../constants/variablesConstants";
import {
  ColorsCollection,
  VariableConfig,
} from "../../../../types/variablesTypes";
import {
  OPACITIES_STEPS,
  SHADE_STEPS,
} from "../../../../../common/constants/colorConstants";
import { hexToFigmaRgba } from "../../../../utils/colorUtils";
import { converter } from "culori";
import { logger } from "../../../../utils/logger";

const COLLECTION_NAME = "Style\\Colors\\Palette";

/**
 * Génère les palettes de couleurs pour Brand et Feedback dans une seule collection
 */
export async function generateColorPalette(
  colors: ColorsCollection,
  colorFamily: string,
): Promise<Variable[]> {
  try {
    const variables: VariableConfig[] = [];
    for (const [name, baseColor] of Object.entries(colors)) {
      const shades = generateShades(baseColor);
      shades.forEach(({ step, color }) => {
        variables.push({
          name: `${colorFamily}/${name}/${step}`.toLowerCase(),
          collection: COLLECTION_NAME,
          type: "COLOR",
          value: color,
          scopes: [SCOPES.COLOR.ALL],
        });
      });
    }
    const newVariables =
      await variableBuilder.createOrUpdateVariables(variables);
    await logger.success(
      `[generateColorPalette] Palette de couleurs ${colorFamily} générée avec succès.`,
    );
    return newVariables;
  } catch (error) {
    await logger.error(
      `Erreur lors de la génération de la palette de couleurs ${colorFamily} :`,
      error,
    );
    throw error;
  }
}

/**
 * Génère la palette de couleurs Neutral
 */
export async function generateNeutralPalette(
  greyHue: string | undefined,
): Promise<Variable[]> {
  let hue = 0;
  if (greyHue !== undefined && greyHue !== "") {
    hue = converter("hsl")(greyHue)?.h || 0;
  }
  const shadeSteps = [0, ...SHADE_STEPS, 1000];
  const shades = generateGreyShades(shadeSteps, hue);
  const colorVariables: VariableConfig[] = [];

  for (const [step, color] of Object.entries(shades)) {
    colorVariables.push({
      name: `neutral/grey/shade/${step}`,
      collection: COLLECTION_NAME,
      type: "COLOR",
      value: color,
      scopes: [SCOPES.COLOR.ALL],
    });
  }

  for (const key of ["grey", "lightGrey", "darkGrey"] as const) {
    const baseColor =
      shades[key === "grey" ? 500 : key === "lightGrey" ? 50 : 950];
    OPACITIES_STEPS.forEach(async (opacity) => {
      const color = await hexToFigmaRgba(baseColor, opacity / 1000);
      colorVariables.push({
        name: `neutral/${key}/opacity/${opacity}`,
        collection: COLLECTION_NAME,
        type: "COLOR",
        value: color,
        scopes: [SCOPES.COLOR.ALL],
      });
    });
  }

  // Crée toutes les variables dans une seule collection
  const newVariables =
    await variableBuilder.createOrUpdateVariables(colorVariables);

  return newVariables;
}
