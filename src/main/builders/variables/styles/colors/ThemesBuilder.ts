import { getContrastColor } from "../../../../../common/utils/colorUtils";
import {
  ColorsCollection,
  VariableConfig,
} from "../../../../types/variablesTypes";
import { variableBuilder } from "../../variableBuilder";
import { generateColorPalette, genrateNeutralPalette } from "./PalettesBuilder";

const COLLECTION_NAME = "Style\\Colors\\Themes";
const MODES = ["Light", "Dark"] as const;

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

        // Chercher ou créer la variable palette correspondante
        let targetVariable = await variableBuilder.findVariable(
          "Style\\Colors\\Palette",
          targetVariableName,
        );

        let targetValue = targetVariable
          ? targetVariable.valuesByMode[
              Object.keys(targetVariable.valuesByMode)[0]
            ]
          : undefined;
        let alias = targetVariable ? targetVariable.id : undefined;
        if (!targetVariable) {
          // Si la variable n'existe pas, générer la palette
          const newVariables = await generateColorPalette(colors, colorFamily);
          const newVariable = newVariables.find(
            (v) => v.name === targetVariableName,
          );
          targetValue = newVariable
            ? newVariable.valuesByMode[Object.keys(newVariable.valuesByMode)[0]]
            : undefined;
          alias = newVariable ? newVariable.id : undefined;
        }

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

            let targetGreyVariable = await variableBuilder.findVariable(
              "Style\\Colors\\Palette",
              greyVariableName,
            );

            if (targetGreyVariable) {
              targetGreyValues[greyShade] = targetGreyVariable.valuesByMode[
                Object.keys(targetGreyVariable.valuesByMode)[0]
              ] as {
                r: number;
                g: number;
                b: number;
                a: number;
              };
            }
            greyAliases[greyShade] = targetGreyVariable
              ? targetGreyVariable.id
              : undefined;
            if (!targetGreyVariable) {
              // Si la variable n'existe pas, générer la palette
              const newVariables = await genrateNeutralPalette(greyHue);
              const newVariable = newVariables.find(
                (v) => v.name === greyVariableName,
              );
              if (newVariable) {
                targetGreyValues[greyShade] = newVariable.valuesByMode[
                  Object.keys(newVariable.valuesByMode)[0]
                ] as {
                  r: number;
                  g: number;
                  b: number;
                  a: number;
                };
              }
              greyAliases[greyShade] = newVariable ? newVariable.id : undefined;
            }
          }

          const contrastColor = getContrastColor(
            targetValue as { r: number; g: number; b: number; a: number },
            targetGreyValues.Light,
            targetGreyValues.Dark,
          );

          variables.push({
            name: `${colorFamily}/${category}/constrast/${shadeName}`.toLowerCase(),
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

        // Chercher ou créer la variable palette correspondante
        let targetVariable = await variableBuilder.findVariable(
          "Style\\Colors\\Palette",
          targetVariableName,
        );

        let alias = targetVariable ? targetVariable.id : undefined;
        if (!targetVariable) {
          // Si la variable n'existe pas, générer la palette
          const newVariables = await generateColorPalette(colors, colorFamily);
          const newVariable = newVariables.find(
            (v) => v.name === targetVariableName,
          );
          alias = newVariable ? newVariable.id : undefined;
        }

        // Créer la variable de thème avec alias vers la palette
        variables.push({
          name: `${colorFamily}/${category}/state/${state}`.toLowerCase(),
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
