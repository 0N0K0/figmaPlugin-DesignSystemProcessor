import { FigmaCollection, FigmaVariable } from "../../types";
import { generateModeJson } from "../../utils/jsonUtils";

const variables: Record<string, Record<string, FigmaVariable>> = {};
const mode = "Value";
const collectionName = "Style/Radius";
export const radiusCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
