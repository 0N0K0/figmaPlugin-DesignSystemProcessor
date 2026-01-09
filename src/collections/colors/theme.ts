import { CoreShades, FigmaCollection, FigmaVariable } from "../../types";
import {
  formatColorValue,
  generateGreyShades,
  generateModeJson,
  generateShades,
  generateVariable,
  getContrastColor,
} from "../../utils";
import { SCOPES, COLORS } from "../../constants";
import { formatHex } from "culori/require";

const modes = ["light", "dark"];

const modesConfig = {
  light: {
    colors: {
      core: {
        light: "400",
        main: "500",
        dark: "600",
      },
      states: {
        enabled: "100",
        disabled: "100",
        hovered: "50",
        selected: "150",
        focused: "300",
      },
    },
    // neutral: {
    //   text: {
    //     core: {
    //       primary: "grey.950",
    //       secondary: "darkGrey.opacities.600",
    //     },
    //     states: {
    //       hover: "darkGrey.opacities.50",
    //       selected: "darkGrey.opacities.400",
    //       focus: "darkGrey.opacities.100",
    //       disabled: "darkGrey.opacities.300",
    //     },
    //   },
    //   background: {
    //     elevations: {
    //       0: "grey.50",
    //       1: "grey.0",
    //       2: "grey.0",
    //       3: "grey.0",
    //       4: "grey.0",
    //       5: "grey.0",
    //       6: "grey.0",
    //       7: "grey.0",
    //       8: "grey.0",
    //       9: "grey.0",
    //       10: "grey.0",
    //       11: "grey.0",
    //       12: "grey.0",
    //     },
    //     states: {
    //       active: "darkGrey.opacities.600",
    //       hover: "darkGrey.opacities.50",
    //       selected: "darkGrey.opacities.100",
    //       focus: "darkGrey.opacities.100",
    //       disabled: "darkGrey.opacities.100",
    //     },
    //   },
    // },
  },
  dark: {
    colors: {
      core: {
        light: "300",
        main: "400",
        dark: "500",
      },
      states: {
        enabled: "100",
        disabled: "100",
        hovered: "100",
        selected: "150",
        focused: "300",
      },
    },
    // neutral: {
    //   text: {
    //     core: {
    //       primary: "grey.50",
    //       secondary: "lightGrey.opacities.600",
    //     },
    //     states: {
    //       hover: "lightGrey.opacities.50",
    //       selected: "lightGrey.opacities.400",
    //       focus: "lightGrey.opacities.100",
    //       disabled: "lightGrey.opacities.300",
    //     },
    //   },
    //   background: {
    //     elevations: {
    //       0: "grey.950",
    //       1: "grey.1000",
    //       2: "grey.975",
    //       3: "grey.950",
    //       4: "grey.925",
    //       5: "grey.900",
    //       6: "grey.875",
    //       7: "grey.850",
    //       8: "grey.825",
    //       9: "grey.800",
    //       10: "grey.775",
    //       11: "grey.750",
    //       12: "grey.725",
    //     },
    //     states: {
    //       active: "lightGrey.opacities.600",
    //       hover: "lightGrey.opacities.50",
    //       selected: "lightGrey.opacities.100",
    //       focus: "lightGrey.opacities.100",
    //       disabled: "lightGrey.opacities.100",
    //     },
    //   },
    // },
  },
};

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
const collectionName = "Theme";

// Helper pour créer une variable couleur avec alias optionnel
const makeColorVariable = (value: string, scope: string[], alias?: string) => {
  return generateVariable(
    "color",
    formatColorValue(value),
    scope,
    false,
    alias,
    alias ? "Palette" : undefined
  );
};

for (const [mode, modeConfig] of Object.entries(modesConfig)) {
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
          state: Object.entries(modeConfig.colors.states).reduce(
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
        // } else if (colorCategory === "neutral") {
        //   variables[colorCategory][colorName] = {
        //     text: {
        //       core: {
        //         primary: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //         secondary: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //       },
        //       state: {
        //         selected: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //         hover: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //         focus: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //         disabled: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //       },
        //     },
        //     background: {
        //       state: {
        //         selected: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //         hover: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //         focus: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //         disabled: generateVariable("color", formatColorValue(colorHex), [
        //           SCOPES.COLOR.ALL,
        //         ]),
        //       },
        //     },
        //   };
      }
      variables[colorCategory][colorName] = {
        ...(variables[colorCategory][colorName] || {}),
        borderColor: makeColorVariable(
          colorHex,
          [SCOPES.COLOR.STROKE_COLOR],
          `{${colorCategory}.${colorName}.opacities.500}`
        ),
      };
    }
  }
  collection[mode] = generateModeJson(collectionName, mode, variables);
}

export const themeCollection: FigmaCollection = {
  name: collectionName,
  modes: modes,
  variables: collection,
};
