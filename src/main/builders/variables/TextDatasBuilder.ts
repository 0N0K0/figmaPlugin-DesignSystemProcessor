import { VariableConfig } from "../../types/variablesTypes";
import { variableBuilder } from "./variableBuilder";
import datas from "../../assets/datas.json";
import { SCOPES } from "../../constants/variablesConstants";

export async function generateTextDatas(
  textDatas?: Record<string, string>[],
): Promise<Variable[]> {
  // Helper to flatten a JSON object
  function flatten(obj: any, prefix = "", out: Record<string, string> = {}) {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        flatten(obj[key], prefix + key + "/", out);
      } else {
        out[prefix + key] = String(obj[key]);
      }
    }
    return out;
  }

  let merged: Record<string, string> = {};
  if (!textDatas || textDatas.length === 0) {
    merged = flatten(datas);
  } else {
    // Merge all key-value pairs from all objects in the array
    for (const obj of textDatas) {
      flatten(obj, "", merged);
    }
  }

  const variables: VariableConfig[] = [];

  for (const [name, value] of Object.entries(merged)) {
    variables.push({
      name: name.toLowerCase(),
      collection: "Datas",
      type: "STRING",
      value: value,
      scopes: [SCOPES.STRING.TEXT_CONTENT],
    });
  }

  return await variableBuilder.createOrUpdateVariables(variables);
}
