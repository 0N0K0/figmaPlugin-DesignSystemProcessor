import { SCOPES } from "../../constants/figmaConstants";
import { FigmaCollection, FigmaVariable } from "../../types";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";

const variables: { [key: string]: FigmaVariable } = {};

const config = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  "2xl": 32,
  rounded: 9999,
};

for (const [key, value] of Object.entries(config)) {
  variables[key] = generateVariable("number", value, [
    SCOPES.FLOAT.CORNER_RADIUS,
  ]);
}

const mode = "Value";
const collectionName = "Style/Radius";
export const radiusCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
