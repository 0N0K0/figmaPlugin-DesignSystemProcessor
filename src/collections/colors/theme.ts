import { CoreShades, FigmaCollection, FigmaVariable } from "../../types";
import { SCOPES, COLORS, THEME_PRESET, THEME_SCHEMA } from "../../constants";
import { formatHex } from "culori/require";
import {
  formatColorValue,
  generateGreyShades,
  generateShades,
  getContrastColor,
} from "../../utils/colorUtils";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";

const modes = ["light", "dark"];

const greyShades = generateGreyShades();

const variables: Record<
  string,
  Record<
    string,
    Record<
      string,
      | FigmaVariable
      | Record<string, FigmaVariable | Record<string, FigmaVariable>>
    >
  >
> = {};

const collection: Record<string, string> = {};
const collectionName = "Style/Colors/Theme";

// Helper pour créer une variable couleur avec alias optionnel
const makeColorVariable = (value: string, scope: string[], alias?: string) => {
  return generateVariable(
    "color",
    formatColorValue(value),
    scope,
    false,
    alias,
    alias ? "Style/Colors/Palette" : undefined
  );
};

const borderColorSchema = THEME_SCHEMA.borderColor;

for (const [mode, modeConfig] of Object.entries(THEME_PRESET)) {
  // Helper pour créer les core shades et contrast
  const makeCoreShades = (
    fn: (step: string, key: "light" | "main" | "dark") => FigmaVariable
  ) =>
    Object.keys(modeConfig.colors.core).reduce((acc, key) => {
      const typedKey = key as "light" | "main" | "dark";
      const step = modeConfig.colors.core[typedKey];
      acc[typedKey] = fn(step, typedKey);
      return acc;
    }, {} as CoreShades);

  for (const [colorCategory, colorValues] of Object.entries(COLORS)) {
    variables[colorCategory] = {};

    // Fonction utilitaire pour ajouter la variable de bordure
    const addBorderColor = (name: string, value: string) => {
      variables[colorCategory][name] = {
        ...(variables[colorCategory][name] || {}),
        borderColor: makeColorVariable(
          value,
          borderColorSchema.scopes,
          `{${colorCategory}.${name}.${borderColorSchema.variableTarget}}`
        ),
      };
    };

    for (const [colorName, colorHex] of Object.entries(colorValues)) {
      // Helper pour récupérer une shade hex
      const getShade = (step: string) =>
        formatHex(
          generateShades(colorHex).find((s) => s.step === step)?.color
        ) ?? colorHex;

      // Utiliser THEME_SCHEMA pour déduire categoryTarget et scopes
      const coreSchema = THEME_SCHEMA.colors.core;
      const stateSchema = THEME_SCHEMA.colors.state;

      variables[colorCategory][colorName] = {
        core: makeCoreShades((step) =>
          makeColorVariable(
            getShade(step),
            coreSchema.scopes,
            `{${colorCategory}.${colorName}.${coreSchema.categoryTarget}.${step}}`
          )
        ),
        contrast: makeCoreShades((step, _) =>
          makeColorVariable(
            getContrastColor(
              getShade(step),
              greyShades["50"],
              greyShades["950"]
            ),
            coreSchema.scopes
          )
        ),
        state: Object.entries(modeConfig.colors.state).reduce(
          (acc, [state, step]) => {
            acc[state] = makeColorVariable(
              getShade(step),
              stateSchema.scopes || [
                SCOPES.COLOR.SHAPE_FILL,
                SCOPES.COLOR.FRAME_FILL,
              ],
              `{${colorCategory}.${colorName}.${stateSchema.categoryTarget}.${step}}`
            );
            return acc;
          },
          {} as Record<string, FigmaVariable>
        ),
      };
      /**
       * @TODO gérer le cas neutral
       */

      addBorderColor(colorName, colorHex);
    }

    // Ajout des variables de bordure pour grey, lightGrey et darkGrey
    ["grey", "lightGrey", "darkGrey"].forEach((greyName) => {
      const value = formatHex(
        greyName === "grey"
          ? greyShades["500"]
          : greyName === "lightGrey"
          ? greyShades["50"]
          : greyShades["950"]
      );
      addBorderColor(greyName, value);
    });
  }
  collection[mode] = generateModeJson(collectionName, mode, variables);
}

export const themeCollection: FigmaCollection = {
  name: collectionName,
  modes: modes,
  variables: collection,
};
