import { converter } from "culori";
import {
  generateGreyShades,
  getContrastColor,
} from "../../../../../common/utils/colorUtils";
import {
  ColorsCollection,
  VariableConfig,
} from "../../../../types/variablesTypes";
import { variableBuilder } from "../../variableBuilder";
import { generateColorPalette, genrateNeutralPalette } from "./PalettesBuilder";
import { logger } from "../../../../utils/logger";
import { toPascalCase } from "../../../../../common/utils/textUtils";

const COLLECTION_NAME = "Style\\Colors\\Themes";
const MODES = ["Light", "Dark"] as const;

function generateDarkElevationSteps(greyHue: string): string[] {
  const darkGreySteps = [];
  for (let i = 0; i < 12; i++) {
    darkGreySteps.push(1000 - i * 25);
  }
  const hue = greyHue && greyHue !== "" ? converter("hsl")(greyHue)?.h || 0 : 0;
  const darkGreyShades = generateGreyShades(darkGreySteps, hue);
  const darkGreyShadesArray = Object.values(darkGreyShades).reverse();

  return Array.from({ length: 12 }, (_, i) => {
    const colorIndex = Math.floor((i / 11) * (darkGreyShadesArray.length - 1));
    return darkGreyShadesArray[colorIndex];
  });
}

async function getTargetValue(
  targetVariableName: string,
  collection: string,
): Promise<{
  alias: string | undefined;
  targetValue: { r: number; g: number; b: number; a: number } | undefined;
  targetVariable: Variable | undefined;
}> {
  let targetVariable = await variableBuilder.findVariable(
    collection,
    targetVariableName,
  );

  let targetValue = targetVariable
    ? targetVariable.valuesByMode[Object.keys(targetVariable.valuesByMode)[0]]
    : undefined;
  let alias = targetVariable ? targetVariable.id : undefined;
  if (collection === "Style\\Colors\\Themes") {
    if (!targetVariable) {
      logger.debug(
        `Variable not found: ${targetVariableName} in collection: ${collection}`,
      );
    } else {
      logger.debug(
        `Variable found: ${targetVariableName} in collection: ${collection} with id: ${targetVariable.id}`,
      );
    }
  }
  return {
    alias,
    targetValue: targetValue as
      | { r: number; g: number; b: number; a: number }
      | undefined,
    targetVariable,
  };
}

async function getOrCreateTargetColor(
  targetVariableName: string,
  colorFamily: string,
  colors: ColorsCollection,
): Promise<{
  alias: string | undefined;
  targetValue: { r: number; g: number; b: number; a: number } | undefined;
}> {
  let { alias, targetValue, targetVariable } = await getTargetValue(
    targetVariableName,
    "Style\\Colors\\Palette",
  );

  if (!targetVariable) {
    // Si la variable n'existe pas, générer la palette
    const newVariables = await generateColorPalette(colors, colorFamily);
    const newVariable = newVariables.find((v) => v.name === targetVariableName);
    targetValue = newVariable
      ? (newVariable.valuesByMode[Object.keys(newVariable.valuesByMode)[0]] as {
          r: number;
          g: number;
          b: number;
          a: number;
        })
      : undefined;
    alias = newVariable ? newVariable.id : undefined;
  }

  return {
    alias,
    targetValue,
  };
}

async function getOrCreateTargetNeutralColor(
  targetVariableName: string,
  greyHue: string,
): Promise<{
  alias: string | undefined;
  targetValue: { r: number; g: number; b: number; a: number } | undefined;
}> {
  let { alias, targetValue, targetVariable } = await getTargetValue(
    targetVariableName,
    "Style\\Colors\\Palette",
  );

  if (!targetVariable) {
    // Si la variable n'existe pas, générer la palette
    const newVariables = await genrateNeutralPalette(greyHue);
    const newVariable = newVariables.find((v) => v.name === targetVariableName);
    if (newVariable) {
      targetValue = newVariable.valuesByMode[
        Object.keys(newVariable.valuesByMode)[0]
      ] as {
        r: number;
        g: number;
        b: number;
        a: number;
      };
      alias = newVariable.id;
    }
  }

  return {
    alias,
    targetValue,
  };
}

export async function generateColorThemes(
  coreShades: Record<string, Record<string, number>>,
  themes: Record<string, string>,
  colorFamily: string,
  colors: ColorsCollection,
  greyHue: string,
): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  for (const mode of MODES) {
    for (const [category, shades] of Object.entries(coreShades)) {
      for (let [shadeName, shadeValue] of Object.entries(shades)) {
        if (mode === "Light") shadeValue += 100;
        // Construire le nom de la variable cible dans la palette
        const targetVariableName =
          `${colorFamily}/${category}/shade/${shadeValue}`.toLowerCase();

        const { alias, targetValue } = await getOrCreateTargetColor(
          targetVariableName,
          colorFamily,
          colors,
        );

        // Créer la variable de thème avec alias vers la palette
        variables.push({
          name: `${colorFamily}/${category}/core/${shadeName}`.toLowerCase(),
          collection: COLLECTION_NAME,
          type: "COLOR",
          mode,
          alias,
          value: alias ? undefined : "#fff",
        });

        // Gérer les couleurs de contraste
        if (targetValue) {
          const targetGroup = "neutral/grey/shade";
          const targetGreyValues: Record<
            string,
            { r: number; g: number; b: number; a: number }
          > = {
            Light: {
              r: 1,
              g: 1,
              b: 1,
              a: 1,
            },
            Dark: {
              r: 0,
              g: 0,
              b: 0,
              a: 1,
            },
          };
          const greyAliases: Record<string, string | undefined> = {};

          for (const [greyShade, greyValue] of Object.entries({
            Light: 50,
            Dark: 950,
          })) {
            const greyVariableName =
              `${targetGroup}/${greyValue}`.toLowerCase();

            const { alias, targetValue } = await getOrCreateTargetNeutralColor(
              greyVariableName,
              greyHue,
            );

            if (targetValue) {
              targetGreyValues[greyShade] = targetValue;
            }
            greyAliases[greyShade] = alias;
          }

          const contrastColor = getContrastColor(
            targetValue as { r: number; g: number; b: number; a: number },
            targetGreyValues.Light,
            targetGreyValues.Dark,
          );

          variables.push({
            name: `${colorFamily}/${category}/contrast/${shadeName}`.toLowerCase(),
            collection: COLLECTION_NAME,
            type: "COLOR",
            mode,
            alias: greyAliases[contrastColor],
            value: greyAliases[contrastColor] ? undefined : "#fff",
          });
        }
      }
      for (const [state, stateValue] of Object.entries(themes)) {
        const targetVariableName =
          `${colorFamily}/${category}/opacity/${stateValue}`.toLowerCase();

        const { alias } = await getOrCreateTargetColor(
          targetVariableName,
          colorFamily,
          colors,
        );

        // Créer la variable de thème avec alias vers la palette
        variables.push({
          name: `${colorFamily}/${category}/${state === "border" ? state : `state/${state}`}`.toLowerCase(),
          collection: COLLECTION_NAME,
          type: "COLOR",
          mode,
          alias,
          value: alias ? undefined : "#fff",
        });
      }
    }
  }

  const newVariables = await variableBuilder.createOrUpdateVariables(variables);

  return newVariables;
}

export async function generateColorsThemesCollections(
  coreShades: Record<string, Record<string, number>>,
  themes: Record<string, string>,
  colorFamily: string,
): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  for (const [category, shades] of Object.entries(coreShades)) {
    for (let shadeName of Object.keys(shades)) {
      // Construire le nom de la variable cible dans la palette
      const targetVariableName =
        `${colorFamily}/${category}/core/${shadeName}`.toLowerCase();

      const { alias } = await getTargetValue(
        targetVariableName,
        "Style\\Colors\\Themes",
      );

      // Créer la variable de thème avec alias vers la palette
      variables.push({
        name: `core/${shadeName}`.toLowerCase(),
        collection: `Style\\Colors\\${colorFamily}`,
        type: "COLOR",
        mode: toPascalCase(category),
        alias,
        value: alias ? undefined : "#fff",
      });

      // Gérer les couleurs de contraste
      const targetContrastVariableName =
        `${colorFamily}/${category}/contrast/${shadeName}`.toLowerCase();

      //   logger.debug(`Getting contrast variable: ${targetContrastVariableName}`);
      //   logger.debug(`From collection: Style\\Colors\\Themes`);

      const TargetValueForDebug = await getTargetValue(
        targetContrastVariableName,
        "Style\\Colors\\Themes",
      );
      //   logger.debug(`Target Value for debug:`);
      //   for (const key in TargetValueForDebug) {
      //     logger.debug(`${key}:`, (TargetValueForDebug as any)[key]);
      //   }
      const { alias: contrastAlias } = await getTargetValue(
        targetContrastVariableName,
        "Style\\Colors\\Themes",
      );

      // Créer la variable de thème avec alias vers la palette
      variables.push({
        name: `contrast/${shadeName}`.toLowerCase(),
        collection: `Style\\Colors\\${colorFamily}`,
        type: "COLOR",
        mode: toPascalCase(category),
        alias: contrastAlias,
        value: contrastAlias ? undefined : "#fff",
      });
    }

    for (const state of Object.keys(themes)) {
      const targetVariableName =
        `${colorFamily}/${category}/${state === "border" ? state : `state/${state}`}`.toLowerCase();

      const { alias } = await getTargetValue(
        targetVariableName,
        "Style\\Colors\\Themes",
      );

      // Créer la variable de thème avec alias vers la palette
      variables.push({
        name: `${state === "border" ? state : `state/${state}`}`.toLowerCase(),
        collection: `Style\\Colors\\${colorFamily}`,
        type: "COLOR",
        mode: toPascalCase(category),
        alias,
        value: alias ? undefined : "#fff",
      });
    }
  }

  const newVariables = await variableBuilder.createOrUpdateVariables(variables);

  return newVariables;
}

export async function generateNeutralThemes(
  colors: Record<string, string | Record<string, number>>,
  border: number = 500,
) {
  const variables: VariableConfig[] = [];

  for (const mode of MODES) {
    const targetMode = mode === "Light" ? "dark" : "light";

    const targetBorderVariableName = `neutral/${targetMode}Grey/opacity/${border}`;
    const { alias: borderAlias } = await getOrCreateTargetNeutralColor(
      targetBorderVariableName,
      colors.greyHue as string,
    );
    variables.push({
      name: `neutral/border`,
      collection: COLLECTION_NAME,
      type: "COLOR",
      mode,
      alias: borderAlias,
      value: borderAlias ? undefined : mode === "Dark" ? "#000" : "#fff",
    });

    const targetVariableGroup = "neutral/grey/shade/";
    const targetVariableName =
      targetVariableGroup + (mode === "Light" ? "950" : "50");

    const { alias } = await getOrCreateTargetNeutralColor(
      targetVariableName,
      colors.greyHue as string,
    );

    variables.push({
      name: `neutral/text/core/primary`,
      collection: COLLECTION_NAME,
      type: "COLOR",
      mode,
      alias,
      value: alias ? undefined : "#fff",
    });

    const elevationConfig =
      mode === "Dark"
        ? {
            baseShade: 950,
            steps: generateDarkElevationSteps(colors.greyHue as string),
          }
        : { baseShade: 50, altShade: 0 };

    for (let i = 0; i <= 12; i++) {
      let alias: string | undefined;
      let color: string | undefined;

      if (mode === "Dark" && i > 0) {
        color = elevationConfig.steps![i - 1];
      } else {
        const targetShade =
          i === 0 ? elevationConfig.baseShade : elevationConfig.altShade;
        ({ alias } = await getOrCreateTargetNeutralColor(
          `neutral/grey/shade/${targetShade || elevationConfig.baseShade}`,
          colors.greyHue as string,
        ));
      }

      variables.push({
        name: `neutral/background/elevations/${i}`,
        collection: COLLECTION_NAME,
        type: "COLOR",
        mode,
        value: alias ? undefined : color || (mode === "Dark" ? "#000" : "#fff"),
        alias,
      });
    }

    for (const [property, values] of Object.entries(colors)) {
      if (typeof values === "string") continue;
      for (const [state, stateValue] of Object.entries(values)) {
        const targetVariableName = `neutral/${targetMode}Grey/opacity/${stateValue}`;
        const { alias } = await getOrCreateTargetNeutralColor(
          targetVariableName,
          colors.greyHue as string,
        );
        variables.push({
          name: `neutral/${property}/${state === "Secondary" ? "core" : "state"}/${state}`.toLowerCase(),
          collection: COLLECTION_NAME,
          type: "COLOR",
          mode,
          value: alias ? undefined : mode === "Dark" ? "#000" : "#fff",
          alias,
        });
      }
    }
  }

  const newVariables = await variableBuilder.createOrUpdateVariables(variables);

  return newVariables;
}
