import { FigmaCollection } from '../types';

const modes = ["light", "dark"];

// Brand
const primary = "#FF5733";
const secondary = "#33C1FF";
const accent = "#75FF33";

// Feedback
const info = "#2096F3";
const success = "#22C55E";
const warning = "#FBBF24";
const error = "#EF4444";

// Neutral
const white = "#FFFFFF";
const grey = "#9CA3AF";
const black = "#000000";

/**
 * brand :
 *   primary
 *   secondary
 *   accent
 * feedback :
 *   info
 *   success
 *   warning
 *   error
 * neutral :
 *   white
 *   grey
 *   black
 *****************************************************************************
 * for brand & feedback colors :
 *   core :
 *     light
 *     main
 *     dark
 *     contrast
 *   state :
 *     selected
 *     hover
 *     focus 
 *     disabled
 *****************************************************************************
 * for neutral colors :
 *   text :
 *     core :
 *       primary
 *       secondary
 *     state :
 *       selected
 *       hover
 *       focus 
 *       disabled
 *   background :
 *     state :
 *       selected
 *       hover
 *       focus 
 *       disabled
 ***************************************************************************
 * for all colors :
 *   border-color
 *   opacity :
 *     10
 *     20
 *     30
 *     40
 *     50
 *     60
 *     70
 *     80
 *     90
 *     95
 */

export const paletteCollection: FigmaCollection = {
    name: 'Palette',
    modes: modes,
    variables: {}
};