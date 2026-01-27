import { converter } from "culori";
import {
  generateGreyShades,
  getContrastColor,
} from "../../../../../common/utils/colorUtils";
import {
  ColorsCollection,
  ElevationConfig,
  VariableConfig,
} from "../../../../types/variablesTypes";
import { variableBuilder } from "../../variableBuilder";
import { toPascalCase } from "../../../../../common/utils/textUtils";
import { SCOPES } from "../../../../constants/variablesConstants";
import {
  OPACITIES_STEPS,
  SHADE_STEPS,
} from "../../../../../common/constants/colorConstants";
import { logger } from "../../../../utils/logger";
import {
  getTargetValue,
  getTargetColor,
  getTargetNeutralColor,
} from "../../../../utils/themesUtils";

const COLLECTION_NAME = "Style\\Colors\\Themes";
const MODES = ["Light", "Dark"] as const;

export async function generateColorThemes(
  coreShades: Record<string, Record<string, number>>,
  themes: Record<string, string>,
  colorFamily: string,
  greyHue: string,
): Promise<Variable[]> {
  const variables: VariableConfig[] = [];
  const opacitiesVariables: VariableConfig[] = [];

  for (const mode of MODES) {
    for (const [category, shades] of Object.entries(coreShades)) {
      for (let [shadeName, shadeValue] of Object.entries(shades)) {
        if (mode === "Light") shadeValue += 100;

        // Construire le nom de la variable cible dans la palette
        const targetVariableName =
          `${colorFamily}/${category}/${shadeValue}`.toLowerCase();

        const { alias, targetValue } = await getTargetColor(
          targetVariableName,
          colorFamily,
          "Style\\Colors\\Palette",
        );

        // Créer la variable de thème avec alias vers la palette
        const coreName =
          `${colorFamily}/${category}/core/${shadeName}`.toLowerCase();
        variables.push({
          name: coreName,
          collection: COLLECTION_NAME,
          type: "COLOR",
          mode,
          alias,
          value: alias ? undefined : "#fff",
        });
        await logger.info(
          `[generateColorThemes] Variable core ${coreName} ajoutée pour le mode ${mode} dans la collection ${COLLECTION_NAME}.`,
        );

        if (shadeName === "main") {
          // Génère les opacités
          OPACITIES_STEPS.forEach(async (step) => {
            if (!targetValue) return;
            // Cloner la couleur de base pour chaque opacité
            const color = { ...targetValue, a: step / 1000 };
            const name =
              `${colorFamily}/${category}/opacity/${step}`.toLowerCase();
            opacitiesVariables.push({
              name,
              collection: COLLECTION_NAME,
              mode,
              type: "COLOR",
              value: color,
              scopes: [SCOPES.COLOR.ALL],
            });
            await logger.info(
              `[generateColorThemes] Variable d'opcacité ${name} ajoutée pour le mode ${mode} dans la collection ${COLLECTION_NAME}.`,
            );
          });
          await variableBuilder.createOrUpdateVariables(opacitiesVariables);
          await logger.success(
            `[generateColorThemes] Variables d'opacité pour ${colorFamily}/${category} générées avec succès pour le mode ${mode} dans la collection ${COLLECTION_NAME}.`,
          );
        }

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

            const { alias, targetValue } =
              await getTargetNeutralColor(greyVariableName);

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

          const name =
            `${colorFamily}/${category}/contrast/${shadeName}`.toLowerCase();
          variables.push({
            name,
            collection: COLLECTION_NAME,
            type: "COLOR",
            mode,
            alias: greyAliases[contrastColor],
            value: greyAliases[contrastColor] ? undefined : "#fff",
          });
          await logger.info(
            `[generateColorThemes] Variable de contraste ${name} ajoutée pour le mode ${mode} dans la collection ${COLLECTION_NAME}.`,
          );
        }
      }
      for (const [state, stateValue] of Object.entries(themes)) {
        const targetVariableName =
          `${colorFamily}/${category}/opacity/${stateValue}`.toLowerCase();

        const { alias, targetValue } = await getTargetColor(
          targetVariableName,
          colorFamily,
          COLLECTION_NAME,
        );

        // Créer la variable de thème avec alias vers la palette
        name;
        variables.push({
          name: `${colorFamily}/${category}/${state === "border" ? `core/${state}` : `state/${state}`}`.toLowerCase(),
          collection: COLLECTION_NAME,
          type: "COLOR",
          mode,
          alias,
          value: alias ? undefined : "#fff",
        });
        await logger.info(
          `[generateColorThemes] Variable d'état/bordure ${colorFamily}/${category}/${state} ajoutée pour le mode ${mode} dans la collection ${COLLECTION_NAME}.`,
        );
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
  colors: ColorsCollection,
): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  for (const [name, baseColor] of Object.entries(colors)) {
    for (const step of SHADE_STEPS) {
      const targetShadeVariableName =
        `${colorFamily}/${name}/${step}`.toLowerCase();
      const { alias: shadeAlias } = await getTargetValue(
        targetShadeVariableName,
        "Style\\Colors\\Palette",
      );
      variables.push({
        name: `shade/${step}`.toLowerCase(),
        collection: `Style\\Colors\\${colorFamily}`,
        type: "COLOR",
        mode: toPascalCase(name),
        alias: shadeAlias,
        value: shadeAlias ? undefined : "#fff",
        scopes: [SCOPES.COLOR.ALL],
      });
    }

    for (const step of OPACITIES_STEPS) {
      const targetOpacityVariableName =
        `${colorFamily}/${name}/opacity/${step}`.toLowerCase();
      const { alias: opacityAlias } = await getTargetValue(
        targetOpacityVariableName,
        "Style\\Colors\\Themes",
      );
      variables.push({
        name: `opacity/${step}`.toLowerCase(),
        collection: `Style\\Colors\\${colorFamily}`,
        type: "COLOR",
        mode: toPascalCase(name),
        alias: opacityAlias,
        value: opacityAlias ? undefined : "#fff",
        scopes: [SCOPES.COLOR.ALL],
      });
    }
  }

  for (const [category, shades] of Object.entries(coreShades)) {
    for (let shadeName of Object.keys(shades)) {
      // Gérer les couleurs centrales
      const targetCoreVariableName =
        `${colorFamily}/${category}/core/${shadeName}`.toLowerCase();

      const { alias: coreAlias } = await getTargetValue(
        targetCoreVariableName,
        "Style\\Colors\\Themes",
      );

      // Créer la variable centrale avec alias vers Themes
      variables.push({
        name: `core/${shadeName}`.toLowerCase(),
        collection: `Style\\Colors\\${colorFamily}`,
        type: "COLOR",
        mode: toPascalCase(category),
        alias: coreAlias,
        value: coreAlias ? undefined : "#fff",
        scopes: [SCOPES.COLOR.ALL_FILLS],
      });

      // Gérer les couleurs de contraste
      const targetContrastVariableName =
        `${colorFamily}/${category}/contrast/${shadeName}`.toLowerCase();

      const { alias: contrastAlias } = await getTargetValue(
        targetContrastVariableName,
        "Style\\Colors\\Themes",
      );

      // Créer la variable de contraste avec alias vers Themes
      variables.push({
        name: `contrast/${shadeName}`.toLowerCase(),
        collection: `Style\\Colors\\${colorFamily}`,
        type: "COLOR",
        mode: toPascalCase(category),
        alias: contrastAlias,
        value: contrastAlias ? undefined : "#fff",
        scopes: [SCOPES.COLOR.ALL_FILLS],
      });
    }

    for (const state of Object.keys(themes)) {
      const targetVariableName =
        `${colorFamily}/${category}/${state === "border" ? `core/${state}` : `state/${state}`}`.toLowerCase();

      const { alias } = await getTargetValue(
        targetVariableName,
        "Style\\Colors\\Themes",
      );

      // Créer la variable de bordure ou d'état avec alias vers Themes
      variables.push({
        name: `${state === "border" ? `core/${state}` : `state/${state}`}`.toLowerCase(),
        collection: `Style\\Colors\\${colorFamily}`,
        type: "COLOR",
        mode: toPascalCase(category),
        alias,
        value: alias ? undefined : "#fff",
        scopes:
          state === "border"
            ? [SCOPES.COLOR.STROKE_COLOR]
            : [SCOPES.COLOR.FRAME_FILL, SCOPES.COLOR.SHAPE_FILL],
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
  try {
    const variables: VariableConfig[] = [];

    for (const mode of MODES) {
      const targetMode = mode === "Light" ? "dark" : "light";

      const targetBorderVariableName = `neutral/${targetMode}Grey/opacity/${border}`;
      const { alias: borderAlias } = await getTargetNeutralColor(
        targetBorderVariableName,
      );
      variables.push({
        name: `neutral/border`,
        collection: COLLECTION_NAME,
        type: "COLOR",
        mode,
        alias: borderAlias,
        value: borderAlias ? undefined : mode === "Dark" ? "#000" : "#fff",
        scopes: [SCOPES.COLOR.STROKE_COLOR],
      });

      const targetVariableGroup = "neutral/grey/shade/";
      const targetVariableName =
        targetVariableGroup + (mode === "Light" ? "950" : "50");

      const { alias } = await getTargetNeutralColor(targetVariableName);

      variables.push({
        name: `neutral/text/core/primary`,
        collection: COLLECTION_NAME,
        type: "COLOR",
        mode,
        alias,
        value: alias ? undefined : "#fff",
        scopes: [SCOPES.COLOR.TEXT_FILL],
      });

      const elevationConfig: ElevationConfig =
        mode === "Dark" ? { baseShade: 950 } : { baseShade: 50, altShade: 0 };

      if (mode === "Dark") {
        const darkGreySteps = [];
        for (let i = 0; i < 12; i++) {
          darkGreySteps.push(1000 - i * 25);
        }
        const hue =
          typeof colors.greyHue === "string" && colors.greyHue !== ""
            ? converter("hsl")(colors.greyHue)?.h || 0
            : 0;
        const darkGreyShades = generateGreyShades(darkGreySteps, hue);
        const darkGreyShadesArray = Object.values(darkGreyShades).reverse();

        elevationConfig.steps = Array.from({ length: 12 }, (_, i) => {
          const colorIndex = Math.floor(
            (i / 11) * (darkGreyShadesArray.length - 1),
          );
          return darkGreyShadesArray[colorIndex];
        });
      }

      for (let i = 0; i <= 12; i++) {
        let alias: string | undefined;
        let color: string | undefined;

        if (mode === "Dark" && i > 0) {
          color = elevationConfig.steps![i - 1];
        } else {
          const targetShade =
            i === 0 ? elevationConfig.baseShade : elevationConfig.altShade;
          ({ alias } = await getTargetNeutralColor(
            `neutral/grey/shade/${targetShade}`,
          ));
        }

        variables.push({
          name: `neutral/background/elevations/${i}`,
          collection: COLLECTION_NAME,
          type: "COLOR",
          mode,
          value: alias
            ? undefined
            : color || (mode === "Dark" ? "#000" : "#fff"),
          alias,
          scopes: [SCOPES.COLOR.FRAME_FILL, SCOPES.COLOR.SHAPE_FILL],
        });
      }

      for (const [property, values] of Object.entries(colors)) {
        if (typeof values === "string") continue;
        for (const [state, stateValue] of Object.entries(values)) {
          const targetVariableName = `neutral/${targetMode}Grey/opacity/${stateValue}`;
          const { alias } = await getTargetNeutralColor(targetVariableName);
          variables.push({
            name: `neutral/${property}/${state === "Secondary" ? "core" : "state"}/${state}`.toLowerCase(),
            collection: COLLECTION_NAME,
            type: "COLOR",
            mode,
            value: alias ? undefined : mode === "Dark" ? "#000000" : "#ffffff",
            alias,
            scopes:
              state === "Secondary"
                ? [SCOPES.COLOR.TEXT_FILL]
                : [SCOPES.COLOR.FRAME_FILL, SCOPES.COLOR.SHAPE_FILL],
          });
        }
      }
    }

    const newVariables =
      await variableBuilder.createOrUpdateVariables(variables);

    await logger.success(
      `[generateNeutralThemes] ${newVariables.length} variables de thèmes neutres créées ou mises à jour avec succès.`,
    );

    return newVariables;
  } catch (error) {
    await logger.error(
      "[generateNeutralThemes] Erreur lors de la génération des thèmes neutres :",
      error,
    );
    throw error;
  }
}
