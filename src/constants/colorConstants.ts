import { SCOPES } from "../constants/figmaConstants";
import dotenv from "dotenv";

dotenv.config();

export const COLORS: Record<string, Record<string, string>> = {
  brand: {
    primary: process.env.BRAND_PRIMARY || "#0DB9F2",
    secondary: process.env.BRAND_SECONDARY || "#4DB2A1",
    accent: process.env.BRAND_ACCENT || "#A68659",
  },
  feedback: {
    info: process.env.FEEDBACK_INFO || "#1AE5C3",
    success: process.env.FEEDBACK_SUCCESS || "#C3E51A",
    warning: process.env.FEEDBACK_WARNING || "#E5801A",
    error: process.env.FEEDBACK_ERROR || "#E53C1A",
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

export const THEME_PRESET = {
  light: {
    colors: {
      core: {
        light: "400",
        main: "500",
        dark: "600",
      },
      state: {
        enabled: process.env.LIGHT_COLORS_ENABLED_OPACITY || "100",
        disabled: process.env.LIGHT_COLORS_DISABLED_OPACITY || "100",
        hovered: process.env.LIGHT_COLORS_HOVERED_OPACITY || "50",
        selected: process.env.LIGHT_COLORS_SELECTED_OPACITY || "150",
        focused: process.env.LIGHT_COLORS_FOCUSED_OPACITY || "300",
      },
    },
    neutral: {
      text: {
        core: {
          primary: "950",
        },
      },
      background: {
        elevations: {
          0: "50",
          1: "0",
          2: "0",
          3: "0",
          4: "0",
          5: "0",
          6: "0",
          7: "0",
          8: "0",
          9: "0",
          10: "0",
          11: "0",
          12: "0",
        },
      },
    },
  },
  dark: {
    colors: {
      core: {
        light: "300",
        main: "400",
        dark: "500",
      },
      state: {
        enabled: process.env.DARK_COLORS_ENABLED_OPACITY || "100",
        disabled: process.env.DARK_COLORS_DISABLED_OPACITY || "100",
        hovered: process.env.DARK_COLORS_HOVERED_OPACITY || "100",
        selected: process.env.DARK_COLORS_SELECTED_OPACITY || "150",
        focused: process.env.DARK_COLORS_FOCUSED_OPACITY || "300",
      },
    },
    neutral: {
      text: {
        core: {
          primary: "50",
        },
      },
      background: {
        elevations: {
          0: "950",
          1: "1000",
          2: "975",
          3: "950",
          4: "925",
          5: "900",
          6: "875",
          7: "850",
          8: "825",
          9: "800",
          10: "775",
          11: "750",
          12: "725",
        },
      },
    },
  },
};

export const THEME_SCHEMA = {
  colors: {
    core: {
      scaleTarget: "shades",
      scopes: [SCOPES.COLOR.SHAPE_FILL, SCOPES.COLOR.FRAME_FILL],
    },
    state: {
      scaleTarget: "opacities",
      scopes: [SCOPES.COLOR.SHAPE_FILL, SCOPES.COLOR.FRAME_FILL],
    },
  },
  neutral: {
    text: {
      core: {
        primary: {
          scaleTarget: "shades",
          toneTarget: "grey",
        },
        secondary: {
          variableTarget: `opacities.${
            process.env.NEUTRAL_TEXT_SECONDARY_OPACITY || "600"
          }`,
          toneTarget: { light: "darkGrey", dark: "lightGrey" },
        },
      },
      state: {
        scaleTarget: "opacities",
        toneTarget: { light: "darkGrey", dark: "lightGrey" },
        variations: {
          hovered: process.env.NEUTRAL_TEXT_HOVERED_OPACITY || "50",
          selected: process.env.NEUTRAL_TEXT_SELECTED_OPACITY || "400",
          focused: process.env.NEUTRAL_TEXT_FOCUSED_OPACITY || "100",
          disabled: process.env.NEUTRAL_TEXT_DISABLED_OPACITY || "300",
        },
      },
      scope: [SCOPES.COLOR.TEXT_FILL],
    },
    background: {
      elevations: {
        scaleTarget: "shades",
        toneTarget: "grey",
      },
      states: {
        scaleTarget: "opacities",
        toneTarget: { light: "darkGrey", dark: "lightGrey" },
        variations: {
          active: process.env.NEUTRAL_BACKGROUND_ACTIVE_OPACITY || "600",
          hovered: process.env.NEUTRAL_BACKGROUND_HOVERED_OPACITY || "50",
          selected: process.env.NEUTRAL_BACKGROUND_SELECTED_OPACITY || "100",
          focused: process.env.NEUTRAL_BACKGROUND_FOCUSED_OPACITY || "100",
          disabled: process.env.NEUTRAL_BACKGROUND_DISABLED_OPACITY || "100",
        },
      },
      scope: [SCOPES.COLOR.FRAME_FILL, SCOPES.COLOR.SHAPE_FILL],
    },
  },
  borderColor: {
    variableTarget: `opacities.${process.env.BORDER_COLOR_OPACITY || "500"}`,
    scopes: [SCOPES.COLOR.STROKE_COLOR],
  },
};
