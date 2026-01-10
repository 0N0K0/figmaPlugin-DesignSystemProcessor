/**
 * Constants pour la génération de variables Figma
 */

export const OUTPUT_DIR = "./output";

/**
 * Scopes pour les variables Figma
 */
export const SCOPES = {
  FLOAT: {
    ALL: "ALL_SCOPES",
    TEXT_CONTENT: "TEXT_CONTENT", //
    CORNER_RADIUS: "CORNER_RADIUS", //
    WIDTH_HEIGHT: "WIDTH_HEIGHT", //
    GAP: "GAP", //
    OPACITY: "OPACITY", //
    STROKE_FLOAT: "STROKE_FLOAT", //
    EFFECT_FLOAT: "EFFECT_FLOAT", //
    FONT_VARIATIONS: "FONT_VARIATIONS", //
    FONT_WEIGHT: "FONT_WEIGHT",
    FONT_SIZE: "FONT_SIZE",
    LINE_HEIGHT: "LINE_HEIGHT",
    LETTER_SPACING: "LETTER_SPACING",
    PARAGRAPH_SPACING: "PARAGRAPH_SPACING",
    PARAGRAPH_INDENT: "PARAGRAPH_INDENT",
  },
  COLOR: {
    ALL: "ALL_SCOPES",
    ALL_FILLS: "ALL_FILLS",
    FRAME_FILL: "FRAME_FILL",
    SHAPE_FILL: "SHAPE_FILL",
    TEXT_FILL: "TEXT_FILL",
    STROKE_COLOR: "STROKE_COLOR",
    EFFECT_COLOR: "EFFECT_COLOR",
  },
  STRING: {
    ALL: "ALL_SCOPES",
    TEXT_CONTENT: "TEXT_CONTENT",
    FONT_FAMILY: "FONT_FAMILY",
    FONT_STYLE: "FONT_STYLE",
  },
} as const;

export const MIN_COLUMN_WIDTH = 96;
export const GUTTER = 16;
export const HORIZONTAL_PADDING = 32;
export const COLUMNS = {
  xs: 3,
  sm: 4,
  md: 6,
  lg: 9,
  xl: 12,
  xxl: 12,
};

export const RATIOS = ["1:1", "4:3", "16:10", "16:9", "18:9", "20:9", "21:9"];
export const ORIENTATIONS = ["portrait", "landscape"];

export const MIN_VIEWPORT_HEIGHT = 312;
export const MAX_CONTENT_HEIGHT = 1080;
export const OFFSET_HEIGHT = 96;

export const BASELINE_GRID = 24;
export const BASE_FONT_SIZE = 16;

export const COLORS: Record<string, Record<string, string>> = {
  brand: {
    primary: "#0DB9F2",
    secondary: "#4DB2A1",
    accent: "#A68659",
  },
  feedback: {
    info: "#1AE5C3",
    success: "#C3E51A",
    warning: "#E5801A",
    error: "#E53C1A",
  },
  neutral: {
    grey: "#808080",
  },
};

export const COLOR_STEPS = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

export const THEME_CONFIG = {
  light: {
    colors: {
      core: {
        light: "400",
        main: "500",
        dark: "600",
      },
      state: {
        enabled: "100",
        disabled: "100",
        hovered: "50",
        selected: "150",
        focused: "300",
      },
    },
    /**
     * @TODO gérer le cas neutral
     * neutral: {
     *   text: {
     *     core: {
     *       primary: "grey.950",
     *       secondary: "darkGrey.opacities.600",
     *     },
     *     states: {
     *       hover: "darkGrey.opacities.50",
     *       selected: "darkGrey.opacities.400",
     *       focus: "darkGrey.opacities.100",
     *       disabled: "darkGrey.opacities.300",
     *     },
     *   },
     *   background: {
     *     elevations: {
     *       0: "grey.50",
     *       1: "grey.0",
     *       2: "grey.0",
     *       3: "grey.0",
     *       4: "grey.0",
     *       5: "grey.0",
     *       6: "grey.0",
     *       7: "grey.0",
     *       8: "grey.0",
     *       9: "grey.0",
     *       10: "grey.0",
     *       11: "grey.0",
     *       12: "grey.0",
     *     },
     *     states: {
     *       active: "darkGrey.opacities.600",
     *       hover: "darkGrey.opacities.50",
     *       selected: "darkGrey.opacities.100",
     *       focus: "darkGrey.opacities.100",
     *       disabled: "darkGrey.opacities.100",
     *     },
     *   },
     * },
     */
  },
  dark: {
    colors: {
      core: {
        light: "300",
        main: "400",
        dark: "500",
      },
      state: {
        enabled: "100",
        disabled: "100",
        hovered: "100",
        selected: "150",
        focused: "300",
      },
    },
    // neutral: {
    //   text: {
    //     core: {
    //       primary: "grey.50",
    //       secondary: "lightGrey.opacities.600",
    //     },
    //     state: {
    //       hover: "lightGrey.opacities.50",
    //       selected: "lightGrey.opacities.400",
    //       focus: "lightGrey.opacities.100",
    //       disabled: "lightGrey.opacities.300",
    //     },
    //   },
    //   background: {
    //     elevations: {
    //       0: "grey.950",
    //       1: "grey.1000",
    //       2: "grey.975",
    //       3: "grey.950",
    //       4: "grey.925",
    //       5: "grey.900",
    //       6: "grey.875",
    //       7: "grey.850",
    //       8: "grey.825",
    //       9: "grey.800",
    //       10: "grey.775",
    //       11: "grey.750",
    //       12: "grey.725",
    //     },
    //     state: {
    //       active: "lightGrey.opacities.600",
    //       hover: "lightGrey.opacities.50",
    //       selected: "lightGrey.opacities.100",
    //       focus: "lightGrey.opacities.100",
    //       disabled: "lightGrey.opacities.100",
    //     },
    //   },
    // },
  },
};
