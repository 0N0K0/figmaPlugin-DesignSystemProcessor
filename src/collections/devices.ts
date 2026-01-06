import { FigmaCollection, FigmaVariable } from '../types';
import { MIN_COLUMN_WIDTH, GUTTER, HORIZONTAL_PADDING, COLUMNS, RATIOS, ORIENTATIONS, MIN_VIEWPORT_HEIGHT, SCOPES } from '../constants';
import { generateModeJson, generateVariable } from '../utils';

const config: Record<string, Record<string, number | Record<string, number>>> = {
  desktop: {
    landscape: {
      xl: 1536,
      lg: 1280,
    },
    ratio: 16/10,
  },
  tablet: {
    portrait: {
      md: 720,
      sm: 640,
    },
    landscape: { 
      md: 1024,
    },
    ratio: 16/10,
  },
  mobile: {
    portrait: { 
      xs: 432,
    },
    landscape: { 
      md: 960,
    },
    ratio: 20/9,
  }
}
const collection : Record<string, Record<string, Record<string, Record<string, FigmaVariable | Record<string, Record<string, FigmaVariable>>>>>> = {};
for (const [device, modes] of Object.entries(config)) {
  for (const [mode, values] of Object.entries(modes)) {
    if (mode === 'ratio') continue;
    for (const [size, value] of Object.entries(values as Record<string, number>)) {
      const height = mode === 'landscape' ? value / (modes['ratio'] as number) : value * (modes['ratio'] as number);
      collection[device][mode][size] = {
        'width': generateVariable('number', value, [SCOPES.FLOAT.WIDTH_HEIGHT], true),
        'height': generateVariable('number', height, [SCOPES.FLOAT.WIDTH_HEIGHT], true)
      };

      const columns = COLUMNS[size as keyof typeof COLUMNS];
      const columnWidth = Math.floor(value - HORIZONTAL_PADDING * 2 - GUTTER * (columns - 1) ) / columns;
      const contentWidths : Record<string, Record<string, FigmaVariable>> = {
        columns: {},
        divisions: {}
      };

      // Largeurs pour chaque nombre de colonnes
      for (let i = 1; i <= 12; i++) {
        let width: number;
        if (i > columns) {
          width = value - HORIZONTAL_PADDING * 2;
        } else {
          width = columnWidth * i + GUTTER * (i - 1);
        }
        contentWidths['columns'][i] = generateVariable('number', Math.min(width, value - HORIZONTAL_PADDING * 2), [], true);
      }

      // Largeurs pour chaque division
      const divisions = [4, 3, 2, 1];
      divisions.forEach(division => {
        let width: number;
        if (columns % division === 0) {
          width = columnWidth * columns / division + GUTTER * ((columns / division) - 1);
        } else {
          const validDivision = divisions.slice(divisions.indexOf(division) + 1).find(d => columns % d === 0)!;
          width = columnWidth * columns / validDivision + GUTTER * ((columns / validDivision) - 1);
        }
        contentWidths['divisions'][`1:${division}`] = generateVariable('number', Math.min(width, value - HORIZONTAL_PADDING * 2), [], true);
      });

      collection[device][mode][size]['contentWidths'] = contentWidths;
    }
  }
}

/**
 * Collection Devices
 */
export const devicesCollection: FigmaCollection = {
  name: 'Devices',
  modes: ['Value'],
  variables: {Value: generateModeJson('Value', collection)}
};