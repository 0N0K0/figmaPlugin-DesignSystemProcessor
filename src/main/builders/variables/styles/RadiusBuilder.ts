import { SCOPES } from "../../../constants/variablesConstants";
import { VariableConfig } from "../../../types/variablesTypes";
import { logger } from "../../../utils/logger";
import { variableBuilder } from "../variableBuilder";

export async function generateRadius(
  radius: Record<string, number>,
): Promise<Variable[]> {
  try {
    const variables: VariableConfig[] = [];
    const radiusConfig: { name: string; value: number }[] = [];

    radiusConfig.push({ name: "square", value: 0 });
    for (const [name, value] of Object.entries(radius)) {
      radiusConfig.push({
        name: name.toLowerCase(),
        value,
      });
    }
    radiusConfig.push({ name: "rounded", value: 9999 });

    for (const { name, value } of radiusConfig) {
      variables.push({
        name,
        collection: "Style\\Radius",
        type: "FLOAT",
        value,
        scopes: [SCOPES.FLOAT.CORNER_RADIUS],
      });
    }

    const newVariables =
      await variableBuilder.createOrUpdateVariables(variables);
    if (newVariables.length === 0) {
      await logger.error(
        "[generateRadius] Aucune variable de radius créée ou mise à jour.",
      );
      throw new Error("Aucune variable de radius créée ou mise à jour.");
    }
    await logger.success(
      `[generateRadius] ${newVariables.length} variables de radius créées ou mises à jour avec succès.`,
    );
    return newVariables;
  } catch (error) {
    await logger.error(
      "[generateRadius] Erreur lors de la génération des variables de radius:",
      error,
    );
    throw error;
  }
}
