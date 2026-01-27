import { VariableConfig } from "../../types/variablesTypes";
import { variableBuilder } from "./variableBuilder";
import datas from "../../assets/datas.json";
import { SCOPES } from "../../constants/variablesConstants";
import { flatten } from "../../utils/dataUtils";

export async function generateTextDatas(
  textDatas?: Record<string, string>[],
): Promise<Variable[]> {
  try {
    let merged: Record<string, string> = {};
    if (!textDatas || textDatas.length === 0) {
      merged = flatten(datas);
    } else {
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
  } catch (error) {
    throw new Error(
      `Erreur lors de la génération des variables de données: ${error}`,
    );
  }
}
