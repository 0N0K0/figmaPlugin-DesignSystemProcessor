import { generateColorCollection } from "../../../utils/collectionGenerator";
import { FigmaCollection } from "../../../types";
import { generateModeJson } from "../../../utils/jsonUtils";

const modes = ["info", "success", "warning", "error"];
const collectionName = "Style/Colors/Feedback";

const { collection } = generateColorCollection({
  modes,
  collectionName,
  prefix: "feedback",
});

const variables: Record<string, string> = {};
for (const mode of modes) {
  variables[mode] = generateModeJson(collectionName, mode, collection[mode]);
}

export const feedbackCollection: FigmaCollection = {
  name: collectionName,
  modes: modes,
  variables: variables,
};
