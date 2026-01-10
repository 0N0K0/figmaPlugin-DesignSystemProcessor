import { CoreShades, FigmaCollection, FigmaVariable } from "../../types";
import {
  formatColorValue,
  generateGreyShades,
  generateModeJson,
  generateShades,
  generateVariable,
  getContrastColor,
} from "../../utils";
import { SCOPES, COLORS, THEME_CONFIG } from "../../constants";
import { formatHex } from "culori/require";

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

for (const [mode, modeConfig] of Object.entries(THEME_CONFIG)) {
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

    for (const [colorName, colorHex] of Object.entries(colorValues)) {
      // Helper pour récupérer une shade hex
      const getShade = (step: string) =>
        formatHex(
          generateShades(colorHex).find((s) => s.step === step)?.color
        ) ?? colorHex;

      if (["brand", "feedback"].includes(colorCategory)) {
        // Générer les core shades, contrast et states
        variables[colorCategory][colorName] = {
          core: makeCoreShades((step) =>
            makeColorVariable(
              getShade(step),
              [SCOPES.COLOR.SHAPE_FILL, SCOPES.COLOR.FRAME_FILL],
              `{${colorCategory}.${colorName}.shades.${step}}`
            )
          ),
          contrast: makeCoreShades((step, key) =>
            makeColorVariable(
              getContrastColor(
                getShade(step),
                greyShades["50"],
                greyShades["950"]
              ),
              [SCOPES.COLOR.TEXT_FILL]
            )
          ),
          state: Object.entries(modeConfig.colors.state).reduce(
            (acc, [state, step]) => {
              acc[state] = makeColorVariable(
                getShade(step),
                [SCOPES.COLOR.SHAPE_FILL, SCOPES.COLOR.FRAME_FILL],
                `{${colorCategory}.${colorName}.opacities.${step}}`
              );
              return acc;
            },
            {} as Record<string, FigmaVariable>
          ),
        };
      }
      /**
       * @TODO gérer le cas neutral
       */

      // Ajouter la variable de bordure
      variables[colorCategory][colorName] = {
        ...(variables[colorCategory][colorName] || {}),
        borderColor: makeColorVariable(
          colorHex,
          [SCOPES.COLOR.STROKE_COLOR],
          `{${colorCategory}.${colorName}.opacities.500}`
        ),
      };
    }
    // Ajout des variables de bordure pour lightGrey et darkGrey
    if (colorCategory === "neutral") {
      ["lightGrey", "darkGrey"].forEach((greyName) => {
        variables[colorCategory][greyName] = {
          borderColor: makeColorVariable(
            formatHex(
              greyName === "lightGrey" ? greyShades["100"] : greyShades["900"]
            ),
            [SCOPES.COLOR.STROKE_COLOR],
            `{${colorCategory}.${greyName}.opacities.500}`
          ),
        };
      });
    }
  }
  collection[mode] = generateModeJson(collectionName, mode, variables);
}

export const themeCollection: FigmaCollection = {
  name: collectionName,
  modes: modes,
  variables: collection,
};
