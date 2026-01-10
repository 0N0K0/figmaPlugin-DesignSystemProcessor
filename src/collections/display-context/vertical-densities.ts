import { SCOPES } from "../../constants/figmaConstants";
import { BASE_FONT_SIZE, BASELINE_GRID } from "../../constants/systemConstants";
import { FigmaCollection } from "../../types";
import { generateVariable } from "../../utils/figmaUtils";
import { generateModeJson } from "../../utils/jsonUtils";

const modes = ["tight", "compact", "loose"];

// Échelles de typographie (multiplicateurs de BASE_FONT_SIZE)
const typographyScales = {
  body: { xs: 0.75, sm: 1, md: 1.25, lg: 2 },
  heading: { xs: 1.25, sm: 2, md: 3, lg: 4, xl: 5 },
};

// Génération des valeurs de typographie avec lineHeight calculée (arrondie au multiple de BASELINE_GRID supérieur)
const baseTypography: Record<string, Record<string, [number, number]>> = {};
for (const [category, sizes] of Object.entries(typographyScales)) {
  baseTypography[category] = {};
  for (const [size, fontScale] of Object.entries(sizes)) {
    const fontSize = BASE_FONT_SIZE * fontScale;
    const lineHeight = Math.ceil(fontSize / BASELINE_GRID) * BASELINE_GRID;
    baseTypography[category][size] = [fontSize, lineHeight];
  }
}

// Échelle d'espacement (multiplicateurs de BASELINE_GRID)
const baseSpacing = {
  "1:4": 1 / 4,
  "1:3": 1 / 3,
  "1:2": 1 / 2,
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
};

type Mode = "tight" | "compact" | "loose";

type ConfigType = {
  tight: {
    minHeight: number;
    aliases: {
      maxTypography: string;
      maxSpacing: number;
    };
    positionSticky: boolean;
  };
  compact: {
    minHeight: number;
    aliases: {
      maxTypography: string;
      maxSpacing: number;
    };
    positionSticky: boolean;
  };
  loose: {
    minHeight: number;
    maxHeight: number;
    typography: typeof baseTypography;
    spacing: typeof baseSpacing;
    positionSticky: boolean;
  };
};

const config: ConfigType = {
  tight: {
    minHeight: BASELINE_GRID * 13,
    aliases: {
      maxTypography: "sm",
      maxSpacing: 4,
    },
    positionSticky: false,
  },
  compact: {
    minHeight: BASELINE_GRID * 23,
    aliases: {
      maxTypography: "md",
      maxSpacing: 6,
    },
    positionSticky: true,
  },
  loose: {
    minHeight: BASELINE_GRID * 33,
    maxHeight: 9999,
    typography: baseTypography,
    spacing: baseSpacing,
    positionSticky: true,
  },
};

const collectionName = "System/Vertical Densities";
const collection: Record<string, any> = {};

for (const [index, [mode, values]] of Object.entries(config).entries()) {
  collection[mode] = {
    viewportHeight: {
      min: generateVariable(
        "number",
        values.minHeight,
        [SCOPES.FLOAT.WIDTH_HEIGHT],
        true
      ),
    },
    typography: { body: {}, heading: {} },
    spacing: {},
  };

  // Max Height
  const nextMode = modes[index + 1] as Mode | undefined;
  if (nextMode) {
    const maxHeight = config[nextMode].minHeight - 1;
    collection[mode].viewportHeight.max = generateVariable(
      "number",
      maxHeight,
      [SCOPES.FLOAT.WIDTH_HEIGHT],
      true
    );
  } else if ("maxHeight" in values) {
    collection[mode].viewportHeight.max = generateVariable(
      "number",
      values.maxHeight,
      [SCOPES.FLOAT.WIDTH_HEIGHT],
      true
    );
  }

  // Typography
  const sizeOrder = ["xs", "sm", "md", "lg", "xl"];
  const hasAliases = (
    obj: any
  ): obj is { aliases: { maxTypography: string; maxSpacing: number } } =>
    typeof obj.aliases === "object" && obj.aliases !== null;
  const maxTypoIndex =
    hasAliases(values) && values.aliases.maxTypography
      ? sizeOrder.indexOf(values.aliases.maxTypography)
      : -1;

  for (const [category, sizes] of Object.entries(baseTypography)) {
    for (const [size, [fontSize, lineHeight]] of Object.entries(sizes)) {
      const currentIndex = sizeOrder.indexOf(size);
      const shouldAlias = maxTypoIndex >= 0 && currentIndex > maxTypoIndex;

      if (shouldAlias && hasAliases(values)) {
        const aliasTarget = values.aliases.maxTypography;
        collection[mode].typography[category][size] = {
          fontSize: generateVariable(
            "number",
            0,
            [SCOPES.FLOAT.FONT_SIZE],
            false,
            `typography.${category}.${aliasTarget}.fontSize`,
            collectionName
          ),
          lineHeight: generateVariable(
            "number",
            0,
            [SCOPES.FLOAT.LINE_HEIGHT],
            false,
            `typography.${category}.${aliasTarget}.lineHeight`,
            collectionName
          ),
        };
      } else {
        collection[mode].typography[category][size] = {
          fontSize: generateVariable("number", fontSize, [
            SCOPES.FLOAT.FONT_SIZE,
          ]),
          lineHeight: generateVariable("number", lineHeight, [
            SCOPES.FLOAT.LINE_HEIGHT,
          ]),
        };
      }
    }
  }

  // Spacing
  const maxSpacing = hasAliases(values) ? values.aliases.maxSpacing : undefined;

  for (const [key, multiplier] of Object.entries(baseSpacing)) {
    const numericValue =
      typeof multiplier === "number"
        ? multiplier
        : parseFloat(key.split(":")[1]) / parseFloat(key.split(":")[0]);
    const shouldAlias = maxSpacing && numericValue > maxSpacing;

    if (shouldAlias) {
      const aliasTarget = maxSpacing.toString();
      collection[mode].spacing[key] = generateVariable(
        "number",
        0, // valeur factice
        [SCOPES.FLOAT.GAP],
        false,
        `spacing.${aliasTarget}`,
        collectionName
      );
    } else {
      collection[mode].spacing[key] = generateVariable(
        "number",
        multiplier * BASELINE_GRID,
        [SCOPES.FLOAT.GAP]
      );
    }
  }

  // Position Sticky
  collection[mode].positionSticky = generateVariable(
    "boolean",
    values.positionSticky
  );
}

const variables: Record<string, string> = {};
modes.forEach((mode) => {
  variables[mode] = generateModeJson(collectionName, mode, collection[mode]);
});

export const verticalDensitiesCollection: FigmaCollection = {
  name: collectionName,
  modes: modes,
  variables: variables,
};
