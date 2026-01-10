import { generateColorCollection } from "../../utils/collectionGenerator";
import { FigmaCollection } from "../../types";
import { generateModeJson } from "../../utils/jsonUtils";

const modes = ["primary", "secondary", "accent"];
const collectionName = "Style/Colors/Brand";

const { collection } = generateColorCollection({
  modes,
  collectionName,
  prefix: "brand",
});

const variables: Record<string, string> = {};
for (const mode of modes) {
  variables[mode] = generateModeJson(collectionName, mode, collection[mode]);
}

export const brandCollection: FigmaCollection = {
  name: collectionName,
  modes: modes,
  variables: variables,
};
