import { ORIENTATIONS, RATIOS } from "../../constants/systemConstants";
import { FigmaCollection, FigmaVariable } from "../../types";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";

const modes: Record<
  string,
  Record<string, Record<string, Record<string, FigmaVariable>>>
> = {};

const collection: Record<string, string> = {};
const collectionName = "System/Ratios";

RATIOS.forEach((ratio) => {
  modes[ratio] = {};
  ORIENTATIONS.forEach((orientation) => {
    modes[ratio][orientation] = {
      viewportHeight: {
        minHeight: generateVariable(
          "number",
          0,
          [],
          false,
          `{viewportHeight.${orientation}.${ratio}.minHeight}`,
          "System/Breakpoints"
        ),
        maxHeight: generateVariable(
          "number",
          0,
          [],
          false,
          `{viewportHeight.${orientation}.${ratio}.maxHeight}`,
          "System/Breakpoints"
        ),
      },
    };
  });
  collection[ratio] = generateModeJson(collectionName, ratio, modes[ratio]);
});

export const ratiosCollection: FigmaCollection = {
  name: collectionName,
  modes: RATIOS,
  variables: collection,
};
