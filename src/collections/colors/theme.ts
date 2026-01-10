import { CoreShades, FigmaCollection, FigmaVariable } from "../../types";
import {
  SCOPES,
  COLORS,
  THEME_PRESET,
  THEME_SCHEMA,
  COLOR_STEPS,
} from "../../constants";
import { formatHex } from "culori/require";
import {
  formatColorValue,
  generateGreyShades,
  generateShades,
  getContrastColor,
} from "../../utils/colorUtils";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";
import { rgb } from "culori";

const modes = ["light", "dark"];

const greyShades = generateGreyShades(COLOR_STEPS);
const darkGreySteps = [];
for (let i = 725; i <= 1000; i += 25) {
  darkGreySteps.push(i.toString());
}
const darkGreyShades = generateGreyShades(darkGreySteps);

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

  // Fonction utilitaire pour ajouter la variable de bordure
  const addBorderColor = (
    value: string,
    colorCategory: string,
    tone: string,
    role?: string
  ) => {
    const borderColorSchema = THEME_SCHEMA.borderColor;
    if (role) {
      variables[colorCategory][role] = {
        ...(variables[colorCategory][role] || {}),
        borderColor: makeColorVariable(
          value,
          borderColorSchema.scopes,
          `{${colorCategory}.${tone}.${borderColorSchema.variableTarget}}`
        ),
      };
    } else {
      variables[colorCategory]["borderColor"] = {
        ...(variables[colorCategory]["borderColor"] || {}),
        borderColor: makeColorVariable(
          value,
          borderColorSchema.scopes,
          `{${colorCategory}.${tone}.${borderColorSchema.variableTarget}}`
        ),
      };
    }
  };

  for (const [colorCategory, colorValues] of Object.entries(COLORS)) {
    variables[colorCategory] = {};

    for (const [colorName, colorHex] of Object.entries(colorValues)) {
      // Helper pour récupérer une shade hex
      const getShade = (step: string) =>
        formatHex(
          generateShades(colorHex).find((s) => s.step === step)?.color
        ) ?? colorHex;

      // Utiliser THEME_SCHEMA pour déduire scaleTarget et scopes
      const coreSchema = THEME_SCHEMA.colors.core;
      const stateSchema = THEME_SCHEMA.colors.state;

      variables[colorCategory][colorName] = {
        core: makeCoreShades((step) =>
          makeColorVariable(
            getShade(step),
            coreSchema.scopes,
            `{${colorCategory}.${colorName}.${coreSchema.scaleTarget}.${step}}`
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
              `{${colorCategory}.${colorName}.${stateSchema.scaleTarget}.${step}}`
            );
            return acc;
          },
          {} as Record<string, FigmaVariable>
        ),
      };

      addBorderColor(colorHex, colorCategory, colorName, colorName);
    }
  }

  // Gestion des couleurs neutral

  const neutralSchema = THEME_SCHEMA.neutral;
  const presetNeutral = THEME_PRESET[mode as keyof typeof THEME_PRESET].neutral;

  if (!variables["neutral"]) variables["neutral"] = {};

  // Helper pour récupérer la couleur d'une toneTarget (grey, lightGrey, darkGrey)
  const getNeutralColor = (tone: string, step: string = "") => {
    let base;
    if (tone === "grey") base = greyShades[step];
    else if (tone === "lightGrey") base = greyShades["50"];
    else if (tone === "darkGrey") base = greyShades["950"];
    else base = greyShades[step] || "#ffffff";
    return formatHex(base);
  };

  // Text
  const textScope = neutralSchema.text.scope;
  // Primary
  const textCorePrimaryTone = neutralSchema.text.core.primary.toneTarget;
  const textCorePrimaryStep = presetNeutral.text.core.primary;
  // Secondary
  const textCoreSecondaryTone = neutralSchema.text.core.secondary.toneTarget;
  const textCoreSecondaryVariable =
    neutralSchema.text.core.secondary.variableTarget;

  // Construction des variables text
  variables["neutral"]["text"] = {
    ...(variables["neutral"]["text"] || {}),
    // Core
    core: {
      primary: makeColorVariable(
        getNeutralColor(textCorePrimaryTone, textCorePrimaryStep),
        textScope,
        `{neutral.${textCorePrimaryTone}.${neutralSchema.text.core.primary.scaleTarget}.${textCorePrimaryStep}}`
      ),
      secondary: makeColorVariable(
        getNeutralColor(textCoreSecondaryTone[mode as "light" | "dark"]),
        textScope,
        `{neutral.${
          textCoreSecondaryTone[mode as "light" | "dark"]
        }.${textCoreSecondaryVariable}}`
      ),
    },
    // State
    state: Object.entries(neutralSchema.text.state.variations).reduce(
      (acc: Record<string, FigmaVariable>, [state, step]) => {
        const stateSchema = neutralSchema.text.state;
        const toneTarget = stateSchema.toneTarget;
        acc[state] = makeColorVariable(
          getNeutralColor(toneTarget[mode as "light" | "dark"]),
          textScope,
          `{neutral.${toneTarget[mode as "light" | "dark"]}.${
            stateSchema.scaleTarget
          }.${step}}`
        );
        return acc;
      },
      {} as Record<string, FigmaVariable>
    ),
  };

  // Background
  const backgroundSchema = neutralSchema.background;
  const backgroundScope = backgroundSchema.scope;
  // Elevations
  const elevationsSchema = backgroundSchema.elevations;
  const elevationsTone = elevationsSchema.toneTarget;
  // States
  const backgroundStates = backgroundSchema.states;
  const backgroundStatesTone = backgroundStates.toneTarget;

  // Construction des variables background
  variables["neutral"]["background"] = {
    ...(variables["neutral"]["background"] || {}),
    // Elevations
    elevations: Object.entries(presetNeutral.background.elevations).reduce(
      (acc, [elevation, step]) => {
        acc[elevation] = makeColorVariable(
          mode === "light"
            ? getNeutralColor(elevationsTone, "50")
            : formatHex(
                rgb({
                  mode: "rgb",
                  r: darkGreyShades[step].r / 255,
                  g: darkGreyShades[step].g / 255,
                  b: darkGreyShades[step].b / 255,
                  alpha: darkGreyShades[step].alpha,
                })
              ),
          backgroundScope,
          mode === "light"
            ? `{neutral.${elevationsTone}.${elevationsSchema.scaleTarget}.${step}}`
            : undefined
        );
        return acc;
      },
      {} as Record<string, FigmaVariable>
    ),
    // States
    states: Object.entries(backgroundStates.variations).reduce(
      (acc: Record<string, FigmaVariable>, [state, step]) => {
        acc[state] = makeColorVariable(
          getNeutralColor(backgroundStatesTone[mode as "light" | "dark"], step),
          backgroundScope,
          `{neutral.${backgroundStatesTone[mode as "light" | "dark"]}.${
            backgroundStates.scaleTarget
          }.${step}}`
        );
        return acc;
      },
      {} as Record<string, FigmaVariable>
    ),
  };

  // Ajout des variables de bordure
  if (mode === "light")
    addBorderColor(getNeutralColor("lightGrey", "50"), "neutral", "lightGrey");
  else
    addBorderColor(getNeutralColor("darkGrey", "950"), "neutral", "darkGrey");

  collection[mode] = generateModeJson(collectionName, mode, variables);
}

export const themeCollection: FigmaCollection = {
  name: collectionName,
  modes: modes,
  variables: collection,
};
