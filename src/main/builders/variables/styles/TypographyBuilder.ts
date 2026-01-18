import { SCOPES } from "../../../constants/variablesConstants";
import { VariableConfig } from "../../../types/variablesTypes";
import { variableBuilder } from "../variableBuilder";

export async function generateFontFamilies(
  fontFamilies: Record<string, string>,
): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  for (const [name, value] of Object.entries(fontFamilies)) {
    variables.push({
      name: name.toLowerCase(),
      collection: "Style\\Typography",
      type: "STRING",
      value: value,
      scopes: [SCOPES.STRING.FONT_FAMILY],
    });
  }

  const newVariables = await variableBuilder.createOrUpdateVariables(variables);

  return newVariables;
}
