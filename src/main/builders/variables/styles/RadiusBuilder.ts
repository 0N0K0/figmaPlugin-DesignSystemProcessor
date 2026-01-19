import { SCOPES } from "../../../constants/variablesConstants";
import { VariableConfig } from "../../../types/variablesTypes";
import { variableBuilder } from "../variableBuilder";

export async function generateRadius(
  radius: Record<string, number>,
): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  for (const [name, value] of Object.entries(radius)) {
    variables.push({
      name: name.toLowerCase(),
      collection: "Style\\Radius",
      type: "FLOAT",
      value,
      scopes: [SCOPES.FLOAT.CORNER_RADIUS],
    });
  }

  return await variableBuilder.createOrUpdateVariables(variables);
}
