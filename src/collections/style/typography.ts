import { SCOPES } from "../../constants/figmaConstants";
import { FigmaCollection, FigmaVariable } from "../../types";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";
import dotenv from "dotenv";

dotenv.config();

const variables: { [key: string]: FigmaVariable } = {};

const config = {
  fontFamilies: {
    interface: process.env.FONT_FAMILY_INTERFACE || "Roboto Condensed",
    accent: process.env.ACCENT_FONT_FAMILY || "Parisienne",
    tech: process.env.TECH_FONT_FAMILY || "Roboto Mono",
    body: process.env.BODY_FONT_FAMILY || "Roboto",
    meta: process.env.META_FONT_FAMILY || "Roboto",
  },
};

for (const [key, value] of Object.entries(config.fontFamilies)) {
  variables[key] = generateVariable("string", value, [
    SCOPES.STRING.FONT_FAMILY,
  ]);
}

const mode = "Value";
const collectionName = "Style/Typography";
export const typographyCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
