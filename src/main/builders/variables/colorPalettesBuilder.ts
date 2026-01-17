/**
 * Génère les palettes de couleurs et crée les variables Figma
 */

import { generateShades } from "../../../common/utils/colorUtils";
import { variableBuilder } from "./variableBuilder";
import { SCOPES } from "../../constants/variablesConstants";
import { ColorsCollection } from "../../types/variablesTypes";


/**
 * Génère les shades pour un groupe de couleurs
 */
function generateColorGroup(
  colors: ColorsCollection,
  groupName: string
): Record<string, string> {
  const variables: Record<string, string> = {};

  for (const [name, baseColor] of Object.entries(colors)) {
    const shades = generateShades(baseColor);
    shades.forEach(({ step, color }) => {
      variables[`${groupName}/${name}/${step}`] = color;
    });
  }

  return variables;
}

/**
 * Génère les palettes de couleurs pour Brand et Feedback dans une seule collection
 */
export async function generateColorPalettes(
  brandColors: ColorsCollection,
  feedbackColors: ColorsCollection
): Promise<void> {
  const collectionName = "Palette";

  // Supprime les anciennes collections "Palette" pour éviter les doublons
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const existingPalettes = collections.filter((c) => c.name === collectionName);
  for (const collection of existingPalettes) {
    // Supprime toutes les variables de la collection
    const variablePromises = collection.variableIds.map((id) =>
      figma.variables.getVariableByIdAsync(id)
    );
    const variables = await Promise.all(variablePromises);
    for (const variable of variables) {
      if (variable) {
        variable.remove();
      }
    }
    // Supprime la collection
    collection.remove();
  }

  console.log(
    `🗑️ ${existingPalettes.length} collection(s) Palette supprimée(s)`
  );

  const allColorVariables = {
    ...generateColorGroup(brandColors, "brand"),
    ...generateColorGroup(feedbackColors, "feedback"),
  };

  console.log(
    `🎨 Génération de ${
      Object.keys(allColorVariables).length
    } variables de couleur...`
  );

  // Crée toutes les variables dans une seule collection
  await variableBuilder.createColorVariables(
    collectionName,
    allColorVariables,
    {
      scopes: [SCOPES.COLOR.ALL_FILLS],
      hidden: false,
    }
  );

  console.log(
    "✅ Toutes les palettes de couleurs créées dans la collection Palette"
  );
}
