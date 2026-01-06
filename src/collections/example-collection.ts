import { FigmaCollection } from '../types';
import { SCOPES } from '../constants';

/**
 * Exemple de collection de variables Figma
 */
export const exampleCollection: FigmaCollection = {
  id: 'collection-1',
  name: 'Design Tokens',
  modes: [
    {
      modeId: 'mode-light',
      name: 'Mode 1',
    },
    {
      modeId: 'mode-dark',
      name: 'Mode 2',
    },
  ],
  variables: [
    {
      id: 'VariableID:3311:3',
      name: 'test number',
      type: 'number',
      scopes: [SCOPES.FLOAT.ALL],
      hiddenFromPublishing: true,
      values: {
        'mode-light': 20,
        'mode-dark': 25,
      },
    },
    {
      id: 'VariableID:3313:5',
      name: 'test color',
      type: 'color',
      scopes: [SCOPES.COLOR.ALL],
      values: {
        'mode-light': { r: 1, g: 1, b: 1, a: 1 },
        'mode-dark': { r: 0.1, g: 0.1, b: 0.1, a: 1 },
      },
    },
    {
      id: 'VariableID:3313:6',
      name: 'test string',
      type: 'string',
      scopes: [SCOPES.STRING.ALL],
      values: {
        'mode-light': 'Valeur de chaîne',
        'mode-dark': 'Valeur de chaîne (dark)',
      },
    },
    {
      id: 'VariableID:3313:7',
      name: 'test boolean',
      type: 'boolean',
      scopes: [SCOPES.FLOAT.ALL],
      values: {
        'mode-light': false,
        'mode-dark': true,
      },
    },
  ],
};
