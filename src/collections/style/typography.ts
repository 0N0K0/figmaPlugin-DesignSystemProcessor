import { FigmaCollection, FigmaVariable } from "../../types";
import { generateModeJson } from "../../utils/jsonUtils";

const variables: Record<string, Record<string, FigmaVariable>> = {};
const mode = "Value";
const collectionName = "Style/Typography";
export const typographyCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
