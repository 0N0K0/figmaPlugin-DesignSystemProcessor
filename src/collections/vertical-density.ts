import { FigmaCollection } from '../types';

const modes = ['loose', 'compact', 'tight'];

/**
 * typography :
 *   body :
 *     fontSize (multiple of 16) / lineHeight (multiple of 24)
 *       xs
 *       sm
 *       md
 *       lg
 *   heading :
 *     fontSize (multiple of 16) / lineHeight (multiple of 24)
 *       xs
 *       sm
 *       md
 *       lg
 * spacing (multiple of 24):
 *   1/4
 *   1/3
 *   1/2
 *   1
 *   2
 *   3
 *   4
 *   5
 *   6
 *   7
 *   8
 */

export const verticalDensityCollection: FigmaCollection = {
    name: 'Vertical Density',
    modes: modes,
    variables: {}
};