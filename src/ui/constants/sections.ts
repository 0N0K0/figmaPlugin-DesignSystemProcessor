import {
  SHADE_STEPS,
  OPACITIES_STEPS,
} from "../../common/constants/colorConstants";
import type { SectionConfig, TabConfig } from "../types";

// Génération des options d'opacité
const opacityOptions = [];
// for (let i = 50; i <= 950; i += 50) {
//   opacityOptions.push({ value: i, label: `${i}` });
// }
for (const opacity of OPACITIES_STEPS) {
  opacityOptions.push({ value: opacity, label: String(opacity) });
}

const shadeOptions = [];
// for (let i = 100; i <= 900; i += 100) {
//   shadeOptions.push({ value: i, label: `${i}` });
// }
// Ajout de 950 séparément
// shadeOptions.push({ value: 950, label: "950" });
for (const shade of SHADE_STEPS) {
  shadeOptions.push({ value: shade, label: String(shade) });
}

export const TABS: TabConfig[] = [
  {
    id: "palette",
    title: "Palette",
    sections: [
      {
        title: "Palette Generator",
        paletteGenerator: true,
      },
      {
        title: "Brand",
        colorCollection: {
          id: "brand",
          maxColors: 10,
          initialColors: [
            { inputId: "brand01", label: "Core", defaultColor: "#0DB9F2" },
            { inputId: "brand02", label: "Support", defaultColor: "#4DB2A1" },
            { inputId: "brand03", label: "Accent", defaultColor: "#A68659" },
          ],
        },
      },
      {
        title: "Feedback",
        colorCollection: {
          id: "feedback",
          maxColors: 10,
          initialColors: [
            { inputId: "feedback01", label: "Info", defaultColor: "#1AE5C3" },
            {
              inputId: "feedback02",
              label: "Success",
              defaultColor: "#C3E51A",
            },
            {
              inputId: "feedback03",
              label: "Warning",
              defaultColor: "#E5801A",
            },
            { inputId: "feedback04", label: "Error", defaultColor: "#E53C1A" },
          ],
        },
      },
      {
        title: "Neutral",
        subsections: [
          {
            colorSelectors: [
              { inputId: "greyTone", label: "Grey Tone", editableLabel: false },
            ],
          },
          {
            title: "Text opacities",
            inputs: [
              {
                id: "neutralTextSecondaryOp",
                label: "Secondary",
                type: "select",
                defaultValue: 600,
                options: opacityOptions,
              },
              {
                id: "neutralTextHoveredOp",
                label: "Hovered",
                type: "select",
                defaultValue: 50,
                options: opacityOptions,
              },
              {
                id: "neutralTextSelectedOp",
                label: "Selected",
                type: "select",
                defaultValue: 400,
                options: opacityOptions,
              },
              {
                id: "neutralTextFocusedOp",
                label: "Focused",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
              {
                id: "neutralTextDisabledOp",
                label: "Disabled",
                type: "select",
                defaultValue: 300,
                options: opacityOptions,
              },
            ],
          },
          {
            title: "Background opacities",
            inputs: [
              {
                id: "neutralBgActiveOp",
                label: "Active",
                type: "select",
                defaultValue: 600,
                options: opacityOptions,
              },
              {
                id: "neutralBgHoveredOp",
                label: "Hovered",
                type: "select",
                defaultValue: 50,
                options: opacityOptions,
              },
              {
                id: "neutralBgSelectedOp",
                label: "Selected",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
              {
                id: "neutralBgFocusedOp",
                label: "Focused",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
              {
                id: "neutralBgDisabledOp",
                label: "Disabled",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
            ],
          },
        ],
      },

      {
        inputs: [
          {
            id: "generate-palettes-btn",
            type: "button",
            label: "Generate Palettes",
            action: "generatePalettes",
          },
        ],
      },
    ],
  },
  {
    id: "themes",
    title: "Themes",
    sections: [
      {
        title: "Light",
        subsections: [
          {
            title: "Core shades",
            inputs: [
              {
                id: "lightCorelightShade",
                label: "light",
                type: "select",
                defaultValue: 400,
                options: shadeOptions,
              },
              {
                id: "lightCoreMainShade",
                label: "main",
                type: "select",
                defaultValue: 500,
                options: shadeOptions,
              },
              {
                id: "lightCoreDarkShade",
                label: "dark",
                type: "select",
                defaultValue: 600,
                options: shadeOptions,
              },
            ],
          },
          {
            title: "State opacities",
            inputs: [
              {
                id: "lightEnabledOp",
                label: "Enabled",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
              {
                id: "lightDisabledOp",
                label: "Disabled",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
              {
                id: "lightHoveredOp",
                label: "Hovered",
                type: "select",
                defaultValue: 50,
                options: opacityOptions,
              },
              {
                id: "lightSelectedOp",
                label: "Selected",
                type: "select",
                defaultValue: 150,
                options: opacityOptions,
              },
              {
                id: "lightFocusedOp",
                label: "Focused",
                type: "select",
                defaultValue: 300,
                options: opacityOptions,
              },
            ],
          },
        ],
      },
      {
        title: "Dark",
        subsections: [
          {
            title: "Core shades",
            inputs: [
              {
                id: "darkCoreLightShade",
                label: "light",
                type: "select",
                defaultValue: 300,
                options: shadeOptions,
              },
              {
                id: "darkCoreMainShade",
                label: "main",
                type: "select",
                defaultValue: 400,
                options: shadeOptions,
              },
              {
                id: "darkCoreDarkShade",
                label: "dark",
                type: "select",
                defaultValue: 500,
                options: shadeOptions,
              },
            ],
          },
          {
            title: "State opacities",
            inputs: [
              {
                id: "darkEnabledOp",
                label: "Enabled",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
              {
                id: "darkDisabledOp",
                label: "Disabled",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
              {
                id: "darkHoveredOp",
                label: "Hovered",
                type: "select",
                defaultValue: 100,
                options: opacityOptions,
              },
              {
                id: "darkSelectedOp",
                label: "Selected",
                type: "select",
                defaultValue: 150,
                options: opacityOptions,
              },
              {
                id: "darkFocusedOp",
                label: "Focused",
                type: "select",
                defaultValue: 300,
                options: opacityOptions,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "layout",
    title: "Layout guide",
    sections: [
      {
        title: "Grid Settings",
        inputs: [
          {
            id: "minColumnWidth",
            label: "Min Column Width",
            type: "number",
            defaultValue: 96,
            min: 0,
          },
          {
            id: "gutter",
            label: "Gutter",
            type: "number",
            defaultValue: 16,
            min: 0,
          },
          {
            id: "horizontalBodyPadding",
            label: "Horizontal Body Padding",
            type: "number",
            defaultValue: 32,
            min: 0,
          },
          {
            id: "baselineGrid",
            label: "Baseline Grid",
            type: "number",
            defaultValue: 24,
            min: 0,
          },
          {
            id: "minViewportHeight",
            label: "Min Viewport Height",
            type: "number",
            defaultValue: 312,
            min: 0,
          },
        ],
      },
      {
        title: "Content Settings",
        inputs: [
          {
            id: "horizontalMainPadding",
            label: "Horizontal Main Padding",
            type: "number",
            defaultValue: 0,
            min: 0,
          },
          {
            id: "maxContentHeight",
            label: "Max Content Height",
            type: "number",
            defaultValue: 1080,
            min: 0,
          },
          {
            id: "offsetHeight",
            label: "Offset Height",
            type: "number",
            defaultValue: 96,
            min: 0,
          },
        ],
      },
    ],
  },
  {
    id: "radius",
    title: "Radius",
    sections: [
      {
        inputs: [
          {
            id: "radiusXS",
            label: "xs",
            type: "number",
            defaultValue: 2,
            min: 0,
          },

          {
            id: "radiusSM",
            label: "sm",
            type: "number",
            defaultValue: 4,
            min: 0,
          },
          {
            id: "radiusMD",
            label: "md",
            type: "number",
            defaultValue: 8,
            min: 0,
          },
          {
            id: "radiusLG",
            label: "lg",
            type: "number",
            defaultValue: 16,
            min: 0,
          },
          {
            id: "radiusXL",
            label: "xl",
            type: "number",
            defaultValue: 24,
            min: 0,
          },
          {
            id: "radius2XL",
            label: "2xl",
            type: "number",
            defaultValue: 32,
            min: 0,
          },
        ],
      },
    ],
  },
  {
    id: "typography",
    title: "Typography",
    sections: [
      {
        inputs: [
          {
            id: "baseFontSize",
            label: "Base Font Size",
            type: "number",
            defaultValue: 16,
            min: 8,
            max: 32,
          },
        ],
      },
      {
        title: "Font Families",
        inputs: [
          {
            id: "bodyFontFamily",
            label: "Body",
            type: "text",
            defaultValue: "Roboto",
          },
          {
            id: "metaFontFamily",
            label: "Meta",
            type: "text",
            defaultValue: "Roboto",
          },
          {
            id: "interfaceFontFamily",
            label: "Interface",
            type: "text",
            defaultValue: "Roboto Condensed",
          },
          {
            id: "accentFontFamily",
            label: "Accent",
            type: "text",
            defaultValue: "Parisienne",
          },
          {
            id: "techFontFamily",
            label: "Tech",
            type: "text",
            defaultValue: "Roboto Mono",
          },
        ],
      },
    ],
  },
  {
    id: "contents",
    title: "Datas",
    sections: [
      {
        inputs: [
          {
            id: "textDatasFile",
            label: "Text",
            type: "file",
            accept: "application/json",
            multiple: true,
            fileList: true,
          },
        ],
      },
      {
        inputs: [
          {
            id: "imagesDatasFile",
            label: "Images",
            type: "file",
            accept: "image/*",
            multiple: true,
            fileList: true,
            imagePreview: true,
          },
        ],
      },
    ],
  },
  {
    id: "effects",
    title: "Effects",
    sections: [
      {
        inputs: [
          {
            id: "create-elevations-btn",
            type: "button",
            label: "Generate Elevations Effects",
            action: "createElevations",
          },
        ],
      },
    ],
  },
];

// Rétro-compatibilité: exporter les sections à plat
export const SECTIONS: SectionConfig[] = TABS.flatMap((tab) => tab.sections);
