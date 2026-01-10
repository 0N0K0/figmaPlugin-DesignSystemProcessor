import { formatHex } from "culori/require";
import { FigmaCollection, FigmaVariable } from "../../types";
import { formatColorValue, generateGreyShades } from "../../utils/colorUtils";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";
import {
  COLOR_STEPS,
  THEME_PRESET,
  THEME_SCHEMA,
} from "../../constants/colorConstants";

const variables: Record<
  string,
  Record<string, FigmaVariable | Record<string, Record<string, FigmaVariable>>>
> = {};

const neutralSchema = THEME_SCHEMA.neutral;

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

const greyShades = generateGreyShades(COLOR_STEPS);

// Helper pour récupérer la couleur d'une toneTarget (grey, lightGrey, darkGrey)
const getNeutralColor = (tone: string, step: string = "") => {
  let base;
  if (tone === "grey") base = greyShades[step];
  else if (tone === "lightGrey") base = greyShades["50"];
  else if (tone === "darkGrey") base = greyShades["950"];
  else base = greyShades[step] || "#ffffff";
  return formatHex(base);
};

// Fonction utilitaire pour ajouter la variable de bordure
const addBorderColor = (value: string, mode: string, tone: string) => {
  const borderColorSchema = THEME_SCHEMA.borderColor;
  variables[mode] = {
    ...(variables[mode] || {}),
    borderColor: makeColorVariable(
      value,
      borderColorSchema.scopes,
      `{neutral.${tone}.${borderColorSchema.variableTarget}}`
    ),
  };
};

for (const mode of Object.keys(THEME_PRESET)) {
  const modeName = mode === "light" ? "dark" : "light";

  if (!variables[modeName]) variables[modeName] = {};
  const presetNeutral = THEME_PRESET[mode as keyof typeof THEME_PRESET].neutral;

  const textScope = neutralSchema.text.scope;

  const textCorePrimaryTone = neutralSchema.text.core.primary.toneTarget;
  const textCorePrimaryStep = presetNeutral.text.core.primary;

  const textCoreSecondaryTone = neutralSchema.text.core.secondary.toneTarget;
  const textCoreSecondaryVariable =
    neutralSchema.text.core.secondary.variableTarget;

  // Construction des variables text
  variables[modeName]["text"] = {
    ...(variables[modeName]["text"] || {}),
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
  // States
  const backgroundStates = backgroundSchema.states;
  const backgroundStatesTone = backgroundStates.toneTarget;

  // Construction des variables background
  variables[modeName]["background"] = {
    ...(variables[modeName]["background"] || {}),
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
  if (mode === "dark")
    addBorderColor(getNeutralColor("lightGrey", "50"), modeName, "lightGrey");
  else addBorderColor(getNeutralColor("darkGrey", "950"), modeName, "darkGrey");
}

// Collection Neutral
const mode = "Value";
const collectionName = "Style/Colors/Neutral";
export const neutralCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
