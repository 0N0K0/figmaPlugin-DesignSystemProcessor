import { ColorsCollection } from "../../../types/variablesTypes";
import { logger } from "../../../utils/logger";
import { generateColorPalette } from "../../variables/styles/colors/PalettesBuilder";
import { variableBuilder } from "../../variables/variableBuilder";
import { styleBuilder } from "../styleBuilder";

function angleToTransform(deg: number): number[][] {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    [cos, sin, 0],
    [-sin, cos, 0],
  ];
}

function getCombinations<T>(array: T[], comboLength: number): T[][] {
  const results: T[][] = [];
  function helper(start: number, combo: T[]) {
    if (combo.length === comboLength) {
      results.push([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return results;
}

export async function generateGradients(
  brandColors: ColorsCollection,
): Promise<void> {
  let colors: Variable[] = await variableBuilder.getCollectionVariablesByGroup(
    "Style\\Colors\\Palette",
    "brand",
  );
  if (colors.length === 0) {
    colors = await generateColorPalette(brandColors, "brand");
  }
  logger.info("colors", colors);
  for (const color of colors) {
    logger.info("color", color.name);
  }

  const brandColorsKeys = Object.keys(brandColors);
  const combos2 = getCombinations(brandColorsKeys, 2);
  const combos3 = getCombinations(brandColorsKeys, 3);

  for (const key of Object.keys(brandColors)) {
    const gradientStops: ColorStop[] = [];
    const shades = [300, 500, 700];
    for (const shade of [300, 500, 700]) {
      gradientStops.push({
        position: shades.indexOf(shade) / (shades.length - 1),
        color: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
        boundVariables: {
          color: {
            type: "VARIABLE_ALIAS",
            id: colors.find(
              (c) => c.name === `brand/${key}/shade/${shade}`.toLowerCase(),
            )!.id,
          },
        },
      });
    }
    await styleBuilder.createOrUpdateStyle(
      `Gradient/${key.toLowerCase()}`,
      "paint",
      [
        {
          type: "GRADIENT_LINEAR",
          gradientTransform: angleToTransform(45) as Transform,
          gradientStops: gradientStops,
        },
      ] as Paint[],
    );
  }

  for (const combo of [...combos2, ...combos3]) {
    if (combo.length === 2) {
      const shades = [600, 400];
      const gradientStops: ColorStop[] = [];
      for (let i = 0; i < shades.length; i++) {
        gradientStops.push({
          position: i,
          color: { r: 0, g: 0, b: 0, a: 1 },
          boundVariables: {
            color: {
              type: "VARIABLE_ALIAS",
              id: colors.find(
                (c) =>
                  c.name ===
                  `brand/${combo[i]}/shade/${shades[i]}`.toLowerCase(),
              )!.id,
            },
          },
        });
      }
      styleBuilder.createOrUpdateStyle(
        `Gradient/${combo.map((k) => k.toLowerCase()).join("-")}`,
        "paint",
        [
          {
            type: "GRADIENT_LINEAR",
            gradientTransform: angleToTransform(45) as Transform,
            gradientStops: gradientStops,
          },
        ] as Paint[],
      );
    } else if (combo.length === 3) {
      const gradientStops: ColorStop[] = [];
      // 3 couleurs : 600→500→400
      const keys = combo;
      const values = [600, 500, 400];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[i];

        gradientStops.push({
          position: i / (keys.length - 1), // 0, 0.5, 1 pour 3 stops
          color: { r: 0, g: 0, b: 0, a: 1 },
          boundVariables: {
            color: {
              type: "VARIABLE_ALIAS",
              id: colors.find(
                (c) => c.name === `brand/${key}/shade/${value}`.toLowerCase(),
              )!.id,
            },
          },
        });
      }
      styleBuilder.createOrUpdateStyle(
        `Gradient/${combo.map((k) => k.toLowerCase()).join("-")}`,
        "paint",
        [
          {
            type: "GRADIENT_LINEAR",
            gradientTransform: angleToTransform(45) as Transform,
            gradientStops: gradientStops,
          },
        ] as Paint[],
      );
    }
  }
}
