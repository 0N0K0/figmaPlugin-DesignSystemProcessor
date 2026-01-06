import { FigmaCollection, FigmaVariable } from '../types';
import { ORIENTATIONS, SCOPES } from '../constants';
import { generateModeJson, generateVariable } from '../utils';

const modes: Record<string, Record<string, Record<string, FigmaVariable>>> = {}
const collection : Record<string, string> = {};
  ORIENTATIONS.forEach(orientation => {
    modes[orientation] = {
      heights: {
        minHeight: generateVariable(
          'number', 
          0, 
          [SCOPES.FLOAT.WIDTH_HEIGHT], 
          false,
          `{heights.${orientation}.minHeight}`,
          'Ratios'
        ),
        maxHeight: generateVariable(
          'number', 
          0,
          [SCOPES.FLOAT.WIDTH_HEIGHT], 
          false,
          `{heights.${orientation}.maxHeight}`,
          'Ratios'
        ),
      }
    };
  collection[orientation] = generateModeJson(orientation, modes[orientation]);
  });

export const orientationsCollection: FigmaCollection = {
  name: 'Orientations',
  modes: ORIENTATIONS,
  variables: collection
};
