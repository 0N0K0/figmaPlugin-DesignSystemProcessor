import { SCOPES } from "../../constants/figmaConstants";
import { ORIENTATIONS } from "../../constants/systemConstants";
import { FigmaCollection, FigmaVariable } from "../../types";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";

const modes: Record<string, Record<string, Record<string, FigmaVariable>>> = {};

const collection: Record<string, string> = {};
const collectionName = "System/Orientations";

ORIENTATIONS.forEach((orientation) => {
  modes[orientation] = {
    viewportHeight: {
      minHeight: generateVariable(
        "number",
        0,
        [SCOPES.FLOAT.WIDTH_HEIGHT],
        false,
        `{${orientation}.viewportHeight.minHeight}`,
        "System/Ratios"
      ),
      maxHeight: generateVariable(
        "number",
        0,
        [SCOPES.FLOAT.WIDTH_HEIGHT],
        false,
        `{${orientation}.viewportHeight.maxHeight}`,
        "System/Ratios"
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
