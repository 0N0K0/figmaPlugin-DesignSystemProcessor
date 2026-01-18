import { SCOPES } from "../../../constants/variablesConstants";
import { VariableConfig } from "../../../types/variablesTypes";
import { logger } from "../../../utils/logger";
import { variableBuilder } from "../variableBuilder";

export async function generateFontSizes(
  baseFontSize: number = 16,
  baselineGrid: number = 24,
): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  const newVariables: Variable[] = [];

  const typographyScales = {
    body: { lg: 2, md: 1.25, sm: 1, xs: 0.75 },
    heading: { xl: 5, lg: 4, md: 3, sm: 2, xs: 1.25 },
  };

  // Génération des valeurs de typographie avec lineHeight calculée (arrondie au multiple de BASELINE_GRID supérieur)
  const baseTypography: Record<string, Record<string, [number, number]>> = {};
  for (const [category, sizes] of Object.entries(typographyScales)) {
    baseTypography[category] = {};
    for (const [size, fontScale] of Object.entries(sizes)) {
      const fontSize = baseFontSize * fontScale;
      const lineHeight = Math.ceil(fontSize / baselineGrid) * baselineGrid;
      baseTypography[category][size] = [fontSize, lineHeight];
    }
  }

  const config = {
    loose: "",
    compact: "md",
    tight: "sm",
  };

  for (const [mode, maxTypography] of Object.entries(config)) {
    const sizeOrder = ["xl", "lg", "md", "sm", "xs"];

    const maxTypoIndex = maxTypography ? sizeOrder.indexOf(maxTypography) : -1;

    for (const [category, sizes] of Object.entries(baseTypography)) {
      for (const [size, [fontSize, lineHeight]] of Object.entries(sizes)) {
        const currentIndex = sizeOrder.indexOf(size);
        const shouldAlias = maxTypoIndex >= 0 && currentIndex < maxTypoIndex;
        logger.info("Should alias?", {
          currentIndex,
          maxTypoIndex,
          shouldAlias,
        });

        if (shouldAlias && maxTypography) {
          const targetVariablesGroup = `typography/${category}/${maxTypography}/`;
          const targetVariablesTypes = [`font-size`, `line-height`];
          const aliases: Record<string, Variable | undefined> = {};
          for (const targetVariableType of targetVariablesTypes) {
            const alias = await variableBuilder.findVariable(
              "System\\VerticalDensity",
              `${targetVariablesGroup}${targetVariableType}`,
            );
            aliases[targetVariableType] = alias;
          }
          for (const [type, alias] of Object.entries(aliases)) {
            const newVariable: VariableConfig = {
              name: `typography/${category}/${size}/${type}`,
              collection: "System\\VerticalDensity",
              mode,
              type: "FLOAT",
              value: alias ? undefined : 0,
              alias: alias?.id,
              scopes:
                type === "font-size"
                  ? [SCOPES.FLOAT.FONT_SIZE]
                  : [SCOPES.FLOAT.LINE_HEIGHT],
            };
            newVariables.push(
              await variableBuilder.createOrUpdateVariable(newVariable),
            );
          }
        } else {
          const fontSizeVariable: VariableConfig = {
            name: `typography/${category}/${size}/font-size`,
            collection: "System\\VerticalDensity",
            mode,
            type: "FLOAT",
            value: fontSize,
            scopes: [SCOPES.FLOAT.FONT_SIZE],
          };
          const lineHeightVariable: VariableConfig = {
            name: `typography/${category}/${size}/line-height`,
            collection: "System\\VerticalDensity",
            mode,
            type: "FLOAT",
            value: lineHeight,
            scopes: [SCOPES.FLOAT.LINE_HEIGHT],
          };
          newVariables.push(
            ...(await variableBuilder.createOrUpdateVariables([
              fontSizeVariable,
              lineHeightVariable,
            ])),
          );
        }
      }
    }
  }

  return newVariables;
}
