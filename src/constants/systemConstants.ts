import dotenv from "dotenv";

dotenv.config();

export const GUTTER = Number(process.env.GUTTER) || 16;
export const HORIZONTAL_BODY_PADDING =
  Number(process.env.HORIZONTAL_BODY_PADDING) || 32;
export const HORIZONTAL_MAIN_PADDING =
  Number(process.env.HORIZONTAL_MAIN_PADDING) || 0;
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

export const MIN_VIEWPORT_HEIGHT =
  Number(process.env.MIN_VIEWPORT_HEIGHT) || 312;
export const MAX_CONTENT_HEIGHT =
  Number(process.env.MAX_CONTENT_HEIGHT) || 1080;
export const OFFSET_HEIGHT = Number(process.env.OFFSET_HEIGHT) || 96;

export const BASELINE_GRID = Number(process.env.BASELINE_GRID) || 24;
export const BASE_FONT_SIZE = Number(process.env.BASE_FONT_SIZE) || 16;
