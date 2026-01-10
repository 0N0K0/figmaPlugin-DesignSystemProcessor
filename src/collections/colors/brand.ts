import { THEME_CONFIG, SCOPES } from "../../constants";
import { FigmaCollection } from "../../types";
import {
  formatColorValue,
  generateModeJson,
  generateVariable,
} from "../../utils";

/**
 * @TODO optimiser et gérer les scopes
 */

const modes = ["primary", "secondary", "accent"];

const collectionName = "Style/Colors/Brand";
const collection: Record<string, string> = {};

for (const mode of modes) {
  const variables: Record<string, Record<string, any>> = {};
  for (const [colorCategory, color] of Object.entries(
    THEME_CONFIG.light.colors
  )) {
    variables[colorCategory] = {};
    for (const [key, value] of Object.entries(color)) {
      variables[colorCategory][key] = generateVariable(
        "color",
        formatColorValue(value),
        [SCOPES.COLOR.ALL],
        false,
        `{brand.${mode}.${colorCategory}.${key}}`,
        "Style/Colors/Theme"
      );
      if (colorCategory === "core") {
        if (!variables["constrast"]) variables["constrast"] = {};
        variables["constrast"][key] = generateVariable(
          "color",
          formatColorValue("#ffffff"),
          [SCOPES.COLOR.ALL],
          false,
          `{brand.${mode}.contrast.${key}}`,
          "Style/Colors/Theme"
        );
      }
    }
  }
  variables["borderColor"] = generateVariable(
    "color",
    formatColorValue("#ffffff"),
    [SCOPES.COLOR.ALL],
    false,
    `{brand.${mode}.borderColor}`,
    "Style/Colors/Theme"
  );
  collection[mode] = generateModeJson(collectionName, mode, variables);
}

export const brandCollection: FigmaCollection = {
  name: collectionName,
  modes: modes,
  variables: collection,
};
