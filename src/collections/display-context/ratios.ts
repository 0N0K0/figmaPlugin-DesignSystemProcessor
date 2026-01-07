import { FigmaCollection, FigmaVariable } from "../../types";
import { RATIOS, ORIENTATIONS } from "../../constants";
import { generateModeJson, generateVariable } from "../../utils";

const modes: Record<
  string,
  Record<string, Record<string, Record<string, FigmaVariable>>>
> = {};
const collection: Record<string, string> = {};
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
          "Breakpoints"
        ),
        maxHeight: generateVariable(
          "number",
          0,
          [],
          false,
          `{viewportHeight.${orientation}.${ratio}.maxHeight}`,
          "Breakpoints"
        ),
      },
    };
  });
  collection[ratio] = generateModeJson(ratio, modes[ratio]);
});

export const ratiosCollection: FigmaCollection = {
  name: "Ratios",
  modes: RATIOS,
  variables: collection,
};
