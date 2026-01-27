import { variableBuilder } from "../builders/variables/variableBuilder";
import { logger } from "./logger";

export async function getTargetValue(
  targetVariableName: string,
  collection: string,
): Promise<{
  alias: string | undefined;
  targetValue: { r: number; g: number; b: number; a: number } | undefined;
  targetVariable: Variable | undefined;
}> {
  let targetVariable = await variableBuilder.findVariable(
    collection,
    targetVariableName,
  );

  let targetValue = targetVariable
    ? targetVariable.valuesByMode[Object.keys(targetVariable.valuesByMode)[0]]
    : undefined;
  let alias = targetVariable ? targetVariable.id : undefined;

  return {
    alias,
    targetValue: targetValue as
      | { r: number; g: number; b: number; a: number }
      | undefined,
    targetVariable,
  };
}

export async function getTargetColor(
  targetVariableName: string,
  colorFamily: string,
  collection: string,
): Promise<{
  alias: string | undefined;
  targetValue: { r: number; g: number; b: number; a: number } | undefined;
}> {
  let { alias, targetValue, targetVariable } = await getTargetValue(
    targetVariableName,
    collection,
  );

  if (!targetVariable) {
    await logger.error(
      `[getOrCreateTargetColor] La variable cible '${targetVariableName}' n'existe pas dans la palette de couleurs ${colorFamily}. Veuillez générer la palette avant de créer les thèmes.`,
    );
    throw new Error(
      `[getOrCreateTargetColor] La variable cible '${targetVariableName}' n'existe pas dans la palette de couleurs ${colorFamily}.`,
    );
  }

  return {
    alias,
    targetValue,
  };
}

export async function getTargetNeutralColor(
  targetVariableName: string,
): Promise<{
  alias: string | undefined;
  targetValue: { r: number; g: number; b: number; a: number } | undefined;
}> {
  let { alias, targetValue, targetVariable } = await getTargetValue(
    targetVariableName,
    "Style\\Colors\\Palette",
  );

  if (!targetVariable) {
    await logger.error(
      `[getOrCreateTargetNeutralColor] La variable cible '${targetVariableName}' n'existe pas dans la palette de couleurs Neutral. Veuillez générer la palette avant de créer les thèmes.`,
    );
    throw new Error(
      `[getOrCreateTargetNeutralColor] La variable cible '${targetVariableName}' n'existe pas dans la palette de couleurs Neutral.`,
    );
  }

  return {
    alias,
    targetValue,
  };
}
