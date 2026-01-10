import {
  COLUMNS,
  GUTTER,
  HORIZONTAL_PADDING,
  MIN_VIEWPORT_HEIGHT,
  ORIENTATIONS,
  RATIOS,
} from "../../constants/systemConstants";
import { FigmaCollection, FigmaVariable } from "../../types";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";
import dotenv from "dotenv";

dotenv.config();

const minColumnWidth = Number(process.env.MIN_COLUMN_WIDTH) || 96;

const modesConfig: Record<
  string,
  {
    columns: number;
    viewportWidth: { minWidth: number; maxWidth: number };
    viewportHeight: Record<
      string,
      Record<string, Record<string, FigmaVariable>>
    >;
    contentWidth: Record<string, Record<string, Record<string, FigmaVariable>>>;
  }
> = {};

for (const [key, value] of Object.entries(COLUMNS)) {
  modesConfig[key as keyof typeof COLUMNS] = {
    columns: value,
    viewportWidth: {
      minWidth: 0,
      maxWidth: 0,
    },
    viewportHeight: {},
    contentWidth: {},
  };
  if (key === "xxl") {
    modesConfig[key as keyof typeof COLUMNS].viewportWidth.minWidth = 1920;
    modesConfig[key as keyof typeof COLUMNS].viewportWidth.maxWidth = 9999;
  }
}

/***
 * Calcul des minviewportWidth
 */
for (const [key, value] of Object.entries(modesConfig)) {
  if (key === "xxl") continue;
  modesConfig[key as keyof typeof modesConfig].viewportWidth.minWidth =
    minColumnWidth * value.columns +
    GUTTER * (value.columns - 1) +
    HORIZONTAL_PADDING * 2;
}

/***
 * Calcul des maxviewportWidth
 */
for (const [key, value] of Object.entries(modesConfig)) {
  if (key === "xxl") continue;
  const nextKey =
    Object.keys(modesConfig)[Object.keys(modesConfig).indexOf(key) + 1];
  modesConfig[key as keyof typeof modesConfig].viewportWidth!.maxWidth =
    modesConfig[nextKey as keyof typeof modesConfig].viewportWidth.minWidth - 1;
}

/***
 * Calcul des viewportHeight
 */
for (const [key, value] of Object.entries(modesConfig)) {
  const viewportHeight: Record<
    string,
    Record<string, Record<string, FigmaVariable>>
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
        minHeight = Math.round(value.viewportWidth.minWidth * calculatedRatio);
        maxHeight = Math.round(value.viewportWidth.maxWidth * calculatedRatio);
      } else {
        minHeight = Math.round(value.viewportWidth.minWidth / calculatedRatio);
        maxHeight = Math.round(value.viewportWidth.maxWidth / calculatedRatio);
      }
      minHeight = Math.max(minHeight, MIN_VIEWPORT_HEIGHT);
      maxHeight = Math.max(maxHeight, MIN_VIEWPORT_HEIGHT);
      viewportHeight[orientation][ratio]["minHeight"] = generateVariable(
        "number",
        minHeight,
        [],
        true
      );
      viewportHeight[orientation][ratio]["maxHeight"] = generateVariable(
        "number",
        Math.round(maxHeight),
        [],
        true
      );
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
    (mode.viewportWidth.maxWidth -
      HORIZONTAL_PADDING * 2 -
      GUTTER * (mode.columns - 1)) /
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
    const maxContentWidth = 1920 - HORIZONTAL_PADDING * 2;

    let minwidth: number;
    if (i > mode.columns) {
      minwidth = mode.viewportWidth.maxWidth - HORIZONTAL_PADDING * 2;
    } else {
      minwidth = minColumnWidth * i + GUTTER * (i - 1);
    }
    contentWidth["columns"][i] = {
      minWidth: generateVariable(
        "number",
        Math.min(minwidth, maxContentWidth),
        [],
        true
      ),
    };

    let maxwidth: number;
    if (i >= mode.columns) {
      maxwidth = mode.viewportWidth.maxWidth - HORIZONTAL_PADDING * 2;
    } else {
      maxwidth = maxColumnWidth[key] * i + GUTTER * (i - 1);
    }
    contentWidth["columns"][i]["maxWidth"] = generateVariable(
      "number",
      Math.min(maxwidth, maxContentWidth),
      [],
      true
    );
  }

  // Largeurs pour chaque division des colonnes
  const divisions = [4, 3, 2, 1];
  divisions.forEach((division) => {
    let minWidth: number;
    let maxWidth: number;
    if (mode.columns % division === 0) {
      minWidth =
        (minColumnWidth * mode.columns) / division +
        GUTTER * (mode.columns / division - 1);
      maxWidth =
        (maxColumnWidth[key] * mode.columns) / division +
        GUTTER * (mode.columns / division - 1);
    } else {
      const validDivision = divisions
        .slice(divisions.indexOf(division) + 1)
        .find((d) => mode.columns % d === 0)!;
      minWidth =
        (minColumnWidth * mode.columns) / validDivision +
        GUTTER * (mode.columns / validDivision - 1);
      maxWidth =
        (maxColumnWidth[key] * mode.columns) / validDivision +
        GUTTER * (mode.columns / validDivision - 1);
    }
    contentWidth["divisions"][`1:${division}`] = {
      minWidth: generateVariable("number", Math.round(minWidth), [], true),
      maxWidth: generateVariable("number", Math.round(maxWidth), [], true),
    };
  });
  modesConfig[key as keyof typeof modesConfig]["contentWidth"] = contentWidth;
}

/***
 * Génération de la collection
 */
const collection: Record<string, string> = {};
const collectionName = "System/Breakpoints";

Object.entries(modesConfig).forEach(([modeId, mode]) => {
  const variables: Record<string, any> = {
    viewportWidth: {},
    viewportHeight: mode.viewportHeight,
    contentWidth: mode.contentWidth,
  };
  Object.entries(mode.viewportWidth!).forEach(([widthKey, widthValue]) => {
    variables["viewportWidth"][widthKey] = generateVariable(
      "number",
      widthValue,
      [],
      true
    );
  });
  collection[modeId] = generateModeJson(collectionName, modeId, variables);
});

/**
 * Collection Breakpoints
 */
export const breakpointsCollection: FigmaCollection = {
  name: collectionName,
  modes: Object.keys(modesConfig),
  variables: collection,
};
