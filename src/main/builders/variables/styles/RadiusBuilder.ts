import { SCOPES } from "../../../constants/variablesConstants";
import { VariableConfig } from "../../../types/variablesTypes";
import { variableBuilder } from "../variableBuilder";

export async function generateRadius(
  radius: Record<string, string>,
): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  for (const [name, value] of Object.entries(radius)) {
    variables.push({
      name: name.toLowerCase(),
      collection: "Style\\Radius",
      type: "FLOAT",
      value: parseFloat(value),
      scopes: [SCOPES.FLOAT.CORNER_RADIUS],
    });
  }

  const newVariables = await variableBuilder.createOrUpdateVariables(variables);

  return newVariables;
}
