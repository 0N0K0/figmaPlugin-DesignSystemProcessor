import { FigmaCollection, FigmaVariable } from "../../types";
import { ORIENTATIONS, SCOPES } from "../../constants";
import { generateModeJson, generateVariable } from "../../utils";

const modes: Record<string, Record<string, Record<string, FigmaVariable>>> = {};
const collection: Record<string, string> = {};
const collectionName = "Orientations";
ORIENTATIONS.forEach((orientation) => {
  modes[orientation] = {
    viewportHeight: {
      minHeight: generateVariable(
        "number",
        0,
        [SCOPES.FLOAT.WIDTH_HEIGHT],
        false,
        `{${orientation}.viewportHeight.minHeight}`,
        "Ratios"
      ),
      maxHeight: generateVariable(
        "number",
        0,
        [SCOPES.FLOAT.WIDTH_HEIGHT],
        false,
        `{${orientation}.viewportHeight.maxHeight}`,
        "Ratios"
      ),
    },
  };
  collection[orientation] = generateModeJson(
    collectionName,
    orientation,
    modes[orientation]
  );
});

export const orientationsCollection: FigmaCollection = {
  name: collectionName,
  modes: ORIENTATIONS,
  variables: collection,
};
