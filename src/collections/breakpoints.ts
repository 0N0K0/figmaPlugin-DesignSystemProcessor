import { FigmaCollection, FigmaVariable } from '../types';
import { MIN_COLUMN_WIDTH, GUTTER, HORIZONTAL_PADDING, RATIOS, ORIENTATIONS, MIN_VIEWPORT_HEIGHT } from '../constants';
import { generateModeJson, generateVariable } from '../utils';

/***
 * Configuration des modes de la collection
 */
const columns = {
  xs: 3,
  sm: 4,
  md: 6,
  lg: 9,
  xl: 12,
  xxl: 12
}

const modesConfig: Record<string, { columns: number; widths: { minWidth: number; maxWidth: number }; heights: Record<string, Record<string, Record<string, FigmaVariable>>>; contentWidths: Record<string, Record<string, Record<string, FigmaVariable>>> }> = {};
for (const [key, value] of Object.entries(columns)) {
  modesConfig[key as keyof typeof columns] = {
    columns: value,
    widths: {
      minWidth: 0,
      maxWidth: 0
    },
    heights: {},
    contentWidths: {}
  };
  if (key === 'xxl') {
    modesConfig[key as keyof typeof columns].widths.minWidth = 1920;
    modesConfig[key as keyof typeof columns].widths.maxWidth = 9999;
  }
}


/***
 * Calcul des minWidths
 */
for (const [key, value] of Object.entries(modesConfig)) {
  if (key === 'xxl') continue;
  modesConfig[key as keyof typeof modesConfig].widths.minWidth = MIN_COLUMN_WIDTH * value.columns + GUTTER * (value.columns - 1) + HORIZONTAL_PADDING * 2;
}

/***
 * Calcul des maxWidths
 */
for (const [key, value] of Object.entries(modesConfig)) {
  if (key === 'xxl') continue;
  const nextKey = Object.keys(modesConfig)[Object.keys(modesConfig).indexOf(key) + 1];
  modesConfig[key as keyof typeof modesConfig].widths!.maxWidth = modesConfig[nextKey as keyof typeof modesConfig].widths.minWidth - 1;
}

/***
 * Calcul des heights
 */
for (const [key, value] of Object.entries(modesConfig)) {
  const heights: Record<string, Record<string, Record<string, FigmaVariable>>> = {};
  ORIENTATIONS.forEach(orientation => {
    heights[orientation] = {};
    RATIOS.forEach(ratio => {
      heights[orientation][ratio] = {};
      const [widthRatio, heightRatio] = ratio.split(':').map(Number);
      const calculatedRatio = heightRatio / widthRatio;
      let minHeight: number;
      let maxHeight: number;
      if (orientation === 'portrait') {
        minHeight = Math.round(value.widths.minWidth * calculatedRatio);
        maxHeight = Math.round(value.widths.maxWidth * calculatedRatio);
      } else {
        minHeight = Math.round(value.widths.minWidth / calculatedRatio);
        maxHeight = Math.round(value.widths.maxWidth / calculatedRatio);
      }
      minHeight = Math.max(minHeight, MIN_VIEWPORT_HEIGHT);
      maxHeight = Math.max(maxHeight, MIN_VIEWPORT_HEIGHT);
      heights[orientation][ratio]["minHeight"] = generateVariable('number', minHeight, [], true);
      heights[orientation][ratio]["maxHeight"] = generateVariable('number', Math.round(maxHeight), [], true);
    });
  });
  modesConfig[key as keyof typeof modesConfig]["heights"] = heights;
}

/***
 * Calcul des maxColumnWidths
 */
const maxColumnWidths: Record<string, number> = {};
for (const [key, mode] of Object.entries(modesConfig)) {
  maxColumnWidths[key] = (mode.widths.maxWidth - HORIZONTAL_PADDING * 2 - GUTTER * (mode.columns - 1)) / mode.columns;
}

/***
 * Calcul des contentWidths
 */
for (const [key, mode] of Object.entries(modesConfig)) {
  const contentWidths : Record<string, any> = {
    columns: {},
    divisions: {}
  };

  // Largeurs pour chaque nombre de colonnes
  for (let i = 1; i <= 12; i++) {
    let minwidth: number;
    if (i > mode.columns) {
      minwidth = mode.widths.maxWidth + 1;
    } else {
      minwidth = MIN_COLUMN_WIDTH * i + GUTTER * (i - 1);
    }
    contentWidths['columns'][i] = { 'minWidth': generateVariable('number', minwidth, [], true) };

    let maxwidth: number;
    if (i >= mode.columns) {
      maxwidth = mode.widths.maxWidth - HORIZONTAL_PADDING * 2;
    } else {
      maxwidth = maxColumnWidths[key] * i + GUTTER * (i - 1);
    }
    contentWidths['columns'][i]['maxWidth'] = generateVariable('number', maxwidth, [], true);
  }

  // Largeurs pour chaque division des colonnes
  const divisions = [4, 3, 2, 1];
  divisions.forEach(division => {
    let minWidth: number;
    let maxWidth: number;
    if (mode.columns % division === 0) {
      minWidth = MIN_COLUMN_WIDTH * mode.columns / division + GUTTER * (mode.columns / division - 1);
      maxWidth = maxColumnWidths[key] * mode.columns / division + GUTTER * (mode.columns / division - 1);
    } else {
      const validDivision = divisions.slice(divisions.indexOf(division) + 1).find(d => mode.columns % d === 0)!;
      minWidth = MIN_COLUMN_WIDTH * mode.columns / validDivision + GUTTER * (mode.columns / validDivision - 1);
      maxWidth = maxColumnWidths[key] * mode.columns / validDivision + GUTTER * (mode.columns / validDivision - 1);
    }
    contentWidths['divisions'][`1:${division}`] = {
      'minWidth': generateVariable('number', Math.round(minWidth), [], true),
      'maxWidth': generateVariable('number', Math.round(maxWidth), [], true)
    };
  });
  modesConfig[key as keyof typeof modesConfig]["contentWidths"] = contentWidths;
}

/***
 * Génération de la collection
 */
const collection: Record<string, string> = {};
Object.entries(modesConfig).forEach(([modeId, mode]) => {
  const variables: Record<string, any> = { widths: {}, heights: mode.heights, contentWidths: mode.contentWidths };
  Object.entries(mode.widths!).forEach(([widthKey, widthValue]) => {
    variables['widths'][widthKey] = generateVariable('number', widthValue, [], true);
  });
  collection[modeId] = generateModeJson(modeId, variables);
})

/**
 * Collection Breakpoints
 */
export const breakpointsCollection: FigmaCollection = {
  name: 'Breakpoints',
  modes: Object.keys(modesConfig),
  variables: collection
};