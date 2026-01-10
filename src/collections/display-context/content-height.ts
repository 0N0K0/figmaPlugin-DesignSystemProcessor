import { SCOPES } from "../../constants/figmaConstants";
import {
  BASELINE_GRID,
  MAX_CONTENT_HEIGHT,
} from "../../constants/systemConstants";
import { FigmaCollection, FigmaVariable } from "../../types";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";

const variables: Record<string, FigmaVariable> = {};
for (let i = BASELINE_GRID; i <= MAX_CONTENT_HEIGHT; i += BASELINE_GRID) {
  const index = i / BASELINE_GRID;
  variables[index] = generateVariable(
    "number",
    i,
    [SCOPES.FLOAT.WIDTH_HEIGHT],
    false
  );
}

const mode = "Value";
const collectionName = "System/Content Height";
export const contentHeightCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
