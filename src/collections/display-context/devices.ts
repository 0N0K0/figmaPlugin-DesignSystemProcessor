import { FigmaCollection, FigmaVariable } from "../../types";
import {
  GUTTER,
  HORIZONTAL_PADDING,
  COLUMNS,
  SCOPES,
  OFFSET_HEIGHT,
  BASELINE_GRID,
} from "../../constants";
import { generateModeJson, generateVariable } from "../../utils";

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
const collection: Record<
  string,
  Record<
    string,
    Record<
      string,
      Record<
        string,
        | FigmaVariable
        | Record<
            string,
            Record<string, FigmaVariable | Record<string, FigmaVariable>>
          >
      >
    >
  >
> = {};
for (const [device, modes] of Object.entries(config)) {
  for (const [mode, values] of Object.entries(modes)) {
    if (mode === "ratio") continue;
    const heights: Record<string, number> = {};
    for (const [size, value] of Object.entries(
      values as Record<string, number>
    )) {
      heights[mode] =
        mode === "landscape"
          ? value / (modes["ratio"] as number)
          : value * (modes["ratio"] as number);
      collection[device][mode][size] = {
        width: generateVariable(
          "number",
          value,
          [SCOPES.FLOAT.WIDTH_HEIGHT],
          true
        ),
        height: generateVariable(
          "number",
          heights[mode],
          [SCOPES.FLOAT.WIDTH_HEIGHT],
          true
        ),
      };

      const columns = COLUMNS[size as keyof typeof COLUMNS];
      const columnWidth =
        Math.floor(value - HORIZONTAL_PADDING * 2 - GUTTER * (columns - 1)) /
        columns;
      const content: Record<
        string,
        Record<string, Record<string, FigmaVariable>>
      > = {
        widths: {
          columns: {},
          divisions: {},
        },
        heights: {
          full: {},
          minusOffset: {},
        },
      };

      // Largeurs du contenu pour chaque nombre de colonnes
      for (let i = 1; i <= 12; i++) {
        let width: number;
        if (i > columns) {
          width = value - HORIZONTAL_PADDING * 2;
        } else {
          width = columnWidth * i + GUTTER * (i - 1);
        }
        content["widths"]["columns"][i] = generateVariable(
          "number",
          Math.min(width, value - HORIZONTAL_PADDING * 2),
          [],
          true
        );
      }

      // Largeurs du contenu pour chaque division
      const divisions = [4, 3, 2, 1];
      divisions.forEach((division) => {
        let width: number;
        if (columns % division === 0) {
          width =
            (columnWidth * columns) / division +
            GUTTER * (columns / division - 1);
        } else {
          const validDivision = divisions
            .slice(divisions.indexOf(division) + 1)
            .find((d) => columns % d === 0)!;
          width =
            (columnWidth * columns) / validDivision +
            GUTTER * (columns / validDivision - 1);
        }
        content["widths"]["divisions"][`1:${division}`] = generateVariable(
          "number",
          Math.min(width, value - HORIZONTAL_PADDING * 2),
          [],
          true
        );
      });

      // Hauteurs du contenu dynamiques
      const pourcentages = [100, 75, 50];
      pourcentages.forEach((pourcentage) => {
        const fullHeight = Math.round((heights[mode] * pourcentage) / 100);
        content["heights"]["full"][`${pourcentage}%`] = generateVariable(
          "number",
          fullHeight,
          [],
          true
        );
        const minusOffsetHeight = Math.round(
          ((heights[mode] - OFFSET_HEIGHT - BASELINE_GRID * 2) * pourcentage) /
            100
        );
        content["heights"]["minusOffset"][`${pourcentage}%`] = generateVariable(
          "number",
          minusOffsetHeight,
          [],
          true
        );
      });

      collection[device][mode][size]["content"] = content;
    }
  }
}

/**
 * Collection Devices
 */
export const devicesCollection: FigmaCollection = {
  name: "Devices",
  modes: ["Value"],
  variables: { Value: generateModeJson("Value", collection) },
};
