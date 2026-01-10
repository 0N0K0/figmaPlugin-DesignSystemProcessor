import { FigmaCollection, FigmaVariable } from "../../types";
import { MAX_CONTENT_HEIGHT, BASELINE_GRID, SCOPES } from "../../constants";
import { generateModeJson, generateVariable } from "../../utils";

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

const mode = "value";
const collectionName = "System/Content Height";
export const contentHeightCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
