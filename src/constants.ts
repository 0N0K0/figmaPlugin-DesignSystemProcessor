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
    white: "#FFFFFF",
    grey: "#808080",
    black: "#000000",
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
