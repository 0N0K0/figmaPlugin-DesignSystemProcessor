import { SCOPES } from "../../constants/variablesConstants";
import { COLUMNS, ORIENTATIONS, RATIOS } from "../../constants/systemConstants";
import {
  DensitiesConfigType,
  DensitiesMode,
  VariableConfig,
} from "../../types/variablesTypes";
import { variableBuilder } from "./variableBuilder";
import { layoutGuideType } from "../../../common/types";

export async function generateBreakpoints({
  minColumnWidth,
  gutter,
  horizontalBodyPadding,
  minViewportHeight,
  horizontalMainPadding,
}: layoutGuideType): Promise<Variable[]> {
  const newVariables: Variable[] = [];

  const breackpointsVariables: VariableConfig[] = [];

  // Configuration des modes
  const modesConfig: Record<
    string,
    {
      columns: number;
      viewportWidth: { min: number; max: number };
      viewportHeight: Record<string, Record<string, Record<string, number>>>;
      contentWidth: Record<string, Record<string, Record<string, number>>>;
    }
  > = {};

  for (const [key, value] of Object.entries(COLUMNS)) {
    modesConfig[key as keyof typeof COLUMNS] = {
      columns: value,
      viewportWidth: {
        min: 0,
        max: 0,
      },
      viewportHeight: {},
      contentWidth: {
        divisions: {},
        columns: {},
      },
    };
    if (key === "xxl") {
      modesConfig[key as keyof typeof COLUMNS].viewportWidth.min = 1920;
      modesConfig[key as keyof typeof COLUMNS].viewportWidth.max = 9999;
    }
  }

  /***
   * Calcul des minviewportWidth
   */
  for (const [key, value] of Object.entries(modesConfig)) {
    if (key === "xxl") continue;
    modesConfig[key as keyof typeof modesConfig].viewportWidth.min =
      minColumnWidth * value.columns +
      gutter * (value.columns - 1) +
      horizontalBodyPadding * 2 +
      horizontalMainPadding * 2;
  }

  /***
   * Calcul des maxviewportWidth
   */
  for (const key of Object.keys(modesConfig)) {
    if (key === "xxl") continue;
    const nextKey =
      Object.keys(modesConfig)[Object.keys(modesConfig).indexOf(key) + 1];
    modesConfig[key as keyof typeof modesConfig].viewportWidth!.max =
      modesConfig[nextKey as keyof typeof modesConfig].viewportWidth.min - 1;
  }

  /***
   * Calcul des viewportHeight
   */
  for (const [key, value] of Object.entries(modesConfig)) {
    const viewportHeight: Record<
      string,
      Record<string, Record<string, number>>
    > = {};
    ORIENTATIONS.forEach((orientation) => {
      viewportHeight[orientation] = {};
      RATIOS.forEach((ratio) => {
        viewportHeight[orientation][ratio] = {};
        const [widthRatio, heightRatio] = ratio.split(":").map(Number);
        const calculatedRatio = heightRatio / widthRatio;
        let minHeight: number;
        let maxHeight: number;
        if (orientation === "portrait") {
          minHeight = Math.round(value.viewportWidth.min * calculatedRatio);
          maxHeight = Math.round(value.viewportWidth.max * calculatedRatio);
        } else {
          minHeight = Math.round(value.viewportWidth.min / calculatedRatio);
          maxHeight = Math.round(value.viewportWidth.max / calculatedRatio);
        }
        minHeight = Math.max(minHeight, minViewportHeight);
        maxHeight = Math.max(maxHeight, minViewportHeight);

        viewportHeight[orientation][ratio]["min"] = minHeight;
        viewportHeight[orientation][ratio]["max"] = Math.round(maxHeight);
      });
    });
    modesConfig[key as keyof typeof modesConfig]["viewportHeight"] =
      viewportHeight;
  }

  /***
   * Calcul des maxColumnWidth
   */
  const maxColumnWidth: Record<string, number> = {};
  for (const [key, mode] of Object.entries(modesConfig)) {
    maxColumnWidth[key] =
      (mode.viewportWidth.max -
        horizontalBodyPadding * 2 -
        horizontalMainPadding * 2 -
        gutter * (mode.columns - 1)) /
      mode.columns;
  }

  /***
   * Calcul des contentWidth
   */
  for (const [key, mode] of Object.entries(modesConfig)) {
    const contentWidth: Record<string, any> = {
      columns: {},
      divisions: {},
    };

    // Largeurs pour chaque nombre de colonnes
    for (let i = 1; i <= 12; i++) {
      const maxContentWidth =
        1920 - horizontalBodyPadding * 2 - horizontalMainPadding * 2;

      let minWidth: number;
      if (i > mode.columns) {
        minWidth =
          mode.viewportWidth.max -
          horizontalBodyPadding * 2 -
          horizontalMainPadding * 2;
      } else {
        minWidth = minColumnWidth * i + gutter * (i - 1);
      }

      let maxWidth: number;
      if (i >= mode.columns) {
        maxWidth =
          mode.viewportWidth.max -
          horizontalBodyPadding * 2 -
          horizontalMainPadding * 2;
      } else {
        maxWidth = maxColumnWidth[key] * i + gutter * (i - 1);
      }
      contentWidth["columns"][i] = {
        min: Math.round(Math.min(minWidth, maxContentWidth)),
        max: Math.round(Math.min(maxWidth, maxContentWidth)),
      };
    }

    // Largeurs pour chaque division des colonnes
    const divisions = [4, 3, 2, 1];
    divisions.forEach((division) => {
      let minWidth: number;
      let maxWidth: number;
      if (mode.columns % division === 0) {
        minWidth =
          (minColumnWidth * mode.columns) / division +
          gutter * (mode.columns / division - 1);
        maxWidth =
          (maxColumnWidth[key] * mode.columns) / division +
          gutter * (mode.columns / division - 1);
      } else {
        const validDivision = divisions
          .slice(divisions.indexOf(division) + 1)
          .find((d) => mode.columns % d === 0)!;
        minWidth =
          (minColumnWidth * mode.columns) / validDivision +
          gutter * (mode.columns / validDivision - 1);
        maxWidth =
          (maxColumnWidth[key] * mode.columns) / validDivision +
          gutter * (mode.columns / validDivision - 1);
      }
      contentWidth["divisions"][`1:${division}`] = {
        min: Math.round(minWidth),
        max: Math.round(maxWidth),
      };
    });
    modesConfig[key as keyof typeof modesConfig]["contentWidth"] = contentWidth;
  }

  for (const [modeName, mode] of Object.entries(modesConfig)) {
    for (const [sizeType, value] of Object.entries(mode.viewportWidth)) {
      // Viewport Width
      breackpointsVariables.push({
        name: `viewport/width/${sizeType}`,
        collection: "System\\Breakpoints",
        type: "FLOAT",
        mode: modeName,
        value,
        hidden: true,
        scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
      });
    }

    // Viewport Height
    for (const [orientation, ratios] of Object.entries(mode.viewportHeight)) {
      for (const [ratio, dimensions] of Object.entries(ratios)) {
        for (const [sizeType, value] of Object.entries(dimensions)) {
          breackpointsVariables.push({
            name: `viewport/height/${orientation}/${ratio}/${sizeType}`,
            collection: "System\\Breakpoints",
            type: "FLOAT",
            mode: modeName,
            value,
            hidden: true,
          });
        }
      }
    }

    // Content Width
    for (const [type, dimensions] of Object.entries(mode.contentWidth)) {
      for (const [dimension, values] of Object.entries(dimensions)) {
        for (const [sizeType, value] of Object.entries(values)) {
          breackpointsVariables.push({
            name: `content-width/${type}/${dimension}/${sizeType}`,
            collection: "System\\Breakpoints",
            type: "FLOAT",
            mode: modeName,
            value,
            hidden: true,
            scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
          });
        }
      }
    }
  }

  newVariables.push(
    ...(await variableBuilder.createOrUpdateVariables(breackpointsVariables)),
  );

  /**
   * Génération des Ratios
   */

  const ratiosVariables: VariableConfig[] = [];

  for (const ratio of RATIOS) {
    for (const orientation of ORIENTATIONS) {
      for (const type of ["min", "max"]) {
        const targetVariable = await variableBuilder.findVariable(
          "System\\Breakpoints",
          `viewport/height/${orientation}/${ratio}/${type}`,
        );
        let alias: string | undefined = undefined;
        if (targetVariable) {
          alias = targetVariable.id;
        }
        ratiosVariables.push({
          name: `${orientation}/viewport-height/${type}`,
          collection: "System\\Ratios",
          type: "FLOAT",
          mode: ratio,
          alias,
          value: alias ? undefined : 0,
          hidden: true,
        });
      }
    }
  }

  newVariables.push(
    ...(await variableBuilder.createOrUpdateVariables(ratiosVariables)),
  );

  /**
   * Génération des Orientations
   */

  for (const orientation of ORIENTATIONS) {
    for (const type of ["min", "max"]) {
      const targetVariable = await variableBuilder.findVariable(
        "System\\Ratios",
        `${orientation}/viewport-height/${type}`,
      );
      let alias: string | undefined = undefined;
      if (targetVariable) {
        alias = targetVariable.id;
      }
      ratiosVariables.push({
        name: `viewport-height/${type}`,
        type: "FLOAT",
        collection: "System\\Orientations",
        mode: orientation,
        scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
        alias,
        value: alias ? undefined : 0,
      });
    }
  }

  newVariables.push(
    ...(await variableBuilder.createOrUpdateVariables(ratiosVariables)),
  );

  return newVariables;
}

export async function generateDensities({
  baselineGrid,
}: layoutGuideType): Promise<Variable[]> {
  const modes: DensitiesMode[] = ["tight", "compact", "loose"];

  // Échelle d'espacement (multiplicateurs de BASELINE_GRID)
  const baseSpacing: Record<string, number> = {
    "1:4": 1 / 4,
    "1:3": 1 / 3,
    "1:2": 1 / 2,
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
  };

  const config: DensitiesConfigType = {
    tight: {
      minHeight: baselineGrid * 13,
      maxSpacing: 4,
      positionSticky: false,
    },
    compact: {
      minHeight: baselineGrid * 23,
      maxSpacing: 6,
      positionSticky: true,
    },
    loose: {
      minHeight: baselineGrid * 33,
      spacing: baseSpacing,
      positionSticky: true,
    },
  };

  const variables: VariableConfig[] = [];
  const newVariables: Variable[] = [];

  for (const [index, [mode, values]] of Object.entries(config).entries()) {
    // Min Height
    variables.push({
      name: `viewport-height/min`,
      type: "FLOAT",
      collection: "System\\VerticalDensities",
      mode,
      value: values.minHeight,
      scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
    });

    // Max Height
    const nextMode = modes[index + 1] as DensitiesMode | undefined;
    let maxHeight: number = 9999;
    if (nextMode) {
      maxHeight = config[nextMode].minHeight - 1;
    }
    variables.push({
      name: `viewport-height/max`,
      type: "FLOAT",
      collection: "System\\VerticalDensities",
      mode,
      value: maxHeight,
      scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
    });

    // Spacing
    for (const [key, multiplier] of Object.entries(baseSpacing)) {
      const shouldAlias =
        "maxSpacing" in values && multiplier > values.maxSpacing;

      let alias: string | undefined = undefined;
      if (shouldAlias) {
        const targetVariable = await variableBuilder.findVariable(
          "System\\VerticalDensities",
          `spacing/${values.maxSpacing}`,
        );
        alias = targetVariable ? targetVariable.id : undefined;
      }
      newVariables.push(
        await variableBuilder.createOrUpdateVariable({
          name: `spacing/${key}`,
          type: "FLOAT",
          collection: "System\\VerticalDensities",
          mode,
          alias,
          value: alias ? undefined : baselineGrid * multiplier,
          scopes: [SCOPES.FLOAT.GAP, SCOPES.FLOAT.PARAGRAPH_SPACING],
        }),
      );
    }

    // Position Sticky
    variables.push({
      name: `position-sticky`,
      type: "BOOLEAN",
      collection: "System\\VerticalDensities",
      mode,
      value: values.positionSticky,
    });
  }

  newVariables.push(
    ...(await variableBuilder.createOrUpdateVariables(variables)),
  );

  return newVariables;
}

export async function generateFontSizes(
  baseFontSize: number = 16,
  baselineGrid: number = 24,
): Promise<Variable[]> {
  const newVariables: Variable[] = [];

  const typographyScales = {
    body: { lg: 2, md: 1.25, sm: 1, xs: 0.75 },
    heading: { "2xl": 5, xl: 4, lg: 3, md: 2.5, sm: 2, xs: 1.5 },
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

        if (shouldAlias && maxTypography) {
          const targetVariablesGroup = `typography/${category}/${maxTypography}/`;
          const targetVariablesTypes = [`font-size`, `line-height`];
          const aliases: Record<string, Variable | undefined> = {};
          for (const targetVariableType of targetVariablesTypes) {
            const alias = await variableBuilder.findVariable(
              "System\\VerticalDensities",
              `${targetVariablesGroup}${targetVariableType}`,
            );
            aliases[targetVariableType] = alias;
          }
          for (const [type, alias] of Object.entries(aliases)) {
            const newVariable: VariableConfig = {
              name: `typography/${category}/${size}/${type}`,
              collection: "System\\VerticalDensities",
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
            collection: "System\\VerticalDensities",
            mode,
            type: "FLOAT",
            value: fontSize,
            scopes: [SCOPES.FLOAT.FONT_SIZE],
          };
          const lineHeightVariable: VariableConfig = {
            name: `typography/${category}/${size}/line-height`,
            collection: "System\\VerticalDensities",
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

export async function generateContentHeights({
  baselineGrid,
  maxContentHeight,
}: layoutGuideType): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  for (let i = baselineGrid; i <= maxContentHeight; i += baselineGrid) {
    const index = i / baselineGrid;
    variables.push({
      name: String(index),
      collection: "System\\ContentHeight",
      type: "FLOAT",
      value: i,
      scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
    });
  }

  return await variableBuilder.createOrUpdateVariables(variables);
}

export async function generateDevices({
  gutter,
  horizontalBodyPadding,
  horizontalMainPadding,
  baselineGrid,
  offsetHeight,
}: layoutGuideType): Promise<Variable[]> {
  const variables: VariableConfig[] = [];

  const config: Record<
    string,
    Record<string, number | Record<string, number>>
  > = {
    desktop: {
      landscape: {
        xl: 1536,
        lg: 1280,
      },
      ratio: 16 / 10,
    },
    tablet: {
      portrait: {
        md: 720,
        sm: 640,
      },
      landscape: {
        md: 1024,
      },
      ratio: 16 / 10,
    },
    mobile: {
      portrait: {
        xs: 432,
      },
      landscape: {
        md: 960,
      },
      ratio: 20 / 9,
    },
  };

  for (const [device, modes] of Object.entries(config)) {
    for (const [mode, values] of Object.entries(modes)) {
      if (mode === "ratio") continue;
      const heights: Record<string, number> = {};
      for (const [size, value] of Object.entries(
        values as Record<string, number>,
      )) {
        heights[mode] =
          mode === "landscape"
            ? value / (modes["ratio"] as number)
            : value * (modes["ratio"] as number);
        variables.push({
          name: `viewport/width`,
          mode: `${device}/${mode}/${size}`,
          collection: "System\\Devices",
          type: "FLOAT",
          value,
          scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
        });
        variables.push({
          name: `viewport/height`,
          mode: `${device}/${mode}/${size}`,
          collection: "System\\Devices",
          type: "FLOAT",
          value: heights[mode],
          scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
        });

        const columns = COLUMNS[size as keyof typeof COLUMNS];
        const columnWidth =
          Math.floor(
            value -
              horizontalBodyPadding * 2 -
              horizontalMainPadding * 2 -
              gutter * (columns - 1),
          ) / columns;

        // Largeurs du contenu pour chaque nombre de colonnes
        for (let i = 1; i <= 12; i++) {
          let width: number;
          if (i > columns) {
            width =
              value - horizontalBodyPadding * 2 - horizontalMainPadding * 2;
          } else {
            width = columnWidth * i + gutter * (i - 1);
          }

          variables.push({
            name: `content/width/columns/${i}`,
            mode: `${device}/${mode}/${size}`,
            collection: "System\\Devices",
            type: "FLOAT",
            value: Math.min(
              width,
              value - horizontalBodyPadding * 2 - horizontalMainPadding * 2,
            ),
            scopes: [SCOPES.FLOAT.WIDTH_HEIGHT],
          });
        }

        // Largeurs du contenu pour chaque division
        const divisions = [4, 3, 2, 1];
        divisions.forEach((division) => {
          let width: number;
          if (columns % division === 0) {
            width =
              (columnWidth * columns) / division +
              gutter * (columns / division - 1);
          } else {
            const validDivision = divisions
              .slice(divisions.indexOf(division) + 1)
              .find((d) => columns % d === 0)!;
            width =
              (columnWidth * columns) / validDivision +
              gutter * (columns / validDivision - 1);
          }
          variables.push({
            name: `content/widths/divisions/1:${division}`,
            mode: `${device}/${mode}/${size}`,
            collection: "System\\Devices",
            type: "FLOAT",
            value: Math.min(
              width,
              value - horizontalBodyPadding * 2 - horizontalMainPadding * 2,
            ),
          });
        });

        // Hauteurs du contenu dynamiques
        const pourcentages = [100, 75, 50];
        pourcentages.forEach((pourcentage) => {
          const fullHeight = Math.round((heights[mode] * pourcentage) / 100);
          variables.push({
            name: `content/height/full/${pourcentage}%`,
            mode: `${device}/${mode}/${size}`,
            collection: "System\\Devices",
            type: "FLOAT",
            value: fullHeight,
          });

          const minusOffsetHeight = Math.round(
            ((heights[mode] - offsetHeight - baselineGrid * 2) * pourcentage) /
              100,
          );
          variables.push({
            name: `content/height/minus-offset/${pourcentage}%`,
            mode: `${device}/${mode}/${size}`,
            collection: "System\\Devices",
            type: "FLOAT",
            value: minusOffsetHeight,
          });
        });
      }
    }
  }

  // À implémenter
  return await variableBuilder.createOrUpdateVariables(variables);
}
