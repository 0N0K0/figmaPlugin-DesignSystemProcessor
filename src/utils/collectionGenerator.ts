import { THEME_PRESET, THEME_SCHEMA } from "../constants";
import { formatColorValue } from "./colorUtils";
import { generateVariable } from "./figmaUtils";

export function generateColorCollection({
  modes,
  collectionName,
  prefix,
}: {
  modes: string[];
  collectionName: string;
  prefix: string;
}) {
  const collection: Record<string, Record<string, any>> = {};
  for (const mode of modes) {
    const variables: Record<string, Record<string, any>> = {};
    for (const [role, color] of Object.entries(THEME_PRESET.light.colors)) {
      variables[role] = {};
      for (const [key, value] of Object.entries(color)) {
        variables[role][key] = generateVariable(
          "color",
          formatColorValue("#ffffff"),
          THEME_SCHEMA.colors[role as keyof typeof THEME_SCHEMA.colors].scopes,
          false,
          `{${prefix}.${mode}.${role}.${key}}`,
          "Style/Colors/Theme"
        );
        if (role === "core") {
          if (!variables["contrast"]) variables["contrast"] = {};
          variables["contrast"][key] = generateVariable(
            "color",
            formatColorValue("#ffffff"),
            THEME_SCHEMA.colors[role as keyof typeof THEME_SCHEMA.colors]
              .scopes,
            false,
            `{${prefix}.${mode}.contrast.${key}}`,
            "Style/Colors/Theme"
          );
        }
      }
    }
    variables["borderColor"] = generateVariable(
      "color",
      formatColorValue("#ffffff"),
      THEME_SCHEMA.borderColor.scopes,
      false,
      `{${prefix}.${mode}.borderColor}`,
      "Style/Colors/Theme"
    );
    collection[mode] = variables;
  }
  return { collectionName, modes, collection };
}
