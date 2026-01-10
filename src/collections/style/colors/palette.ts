import { Rgb } from "culori";
import { FigmaCollection, FigmaVariable } from "../../../types";
import {
  formatColorValue,
  generateGreyShades,
  generateShades,
} from "../../../utils/colorUtils";
import { generateVariable } from "../../../utils/figmaUtils";
import { generateModeJson } from "../../../utils/jsonUtils";
import { SCOPES } from "../../../constants/figmaConstants";
import { COLOR_STEPS, COLORS } from "../../../constants/colorConstants";

// Récupérer les nuances de gris
const greyShades = generateGreyShades(COLOR_STEPS);

const opacitiesSteps = [
  "50",
  "100",
  "150",
  "200",
  "250",
  "300",
  "350",
  "400",
  "450",
  "500",
  "550",
  "600",
  "650",
  "700",
  "750",
  "800",
  "850",
  "900",
  "950",
];
// Fonction utilitaire pour générer les opacités d'une teinte de gris
const generateOpacities = (
  categoryName: string,
  colorName: string,
  r: number,
  g: number,
  b: number
) => {
  if (!variables[categoryName]) variables[categoryName] = {};
  if (!variables[categoryName][colorName])
    variables[categoryName][colorName] = {};
  if (!variables[categoryName][colorName]["opacities"])
    variables[categoryName][colorName]["opacities"] = {};

  for (const step of opacitiesSteps) {
    const a = parseInt(step) / 1000;
    const colorWithOpacity = {
      mode: "rgb" as const,
      r,
      g,
      b,
      alpha: a,
    };
    variables[categoryName][colorName]["opacities"][step] = generateVariable(
      "color",
      formatColorValue(colorWithOpacity),
      [SCOPES.COLOR.ALL]
    );
  }
};

// Stocker toutes les variables de la palette
const variables: Record<
  string,
  Record<string, Record<string, Record<string, FigmaVariable>>>
> = {};

// Parcourir les couleurs définies pour générer les variables
for (const [colorCategory, colorValues] of Object.entries(COLORS)) {
  variables[colorCategory] = {};
  for (const [colorName, colorHex] of Object.entries(colorValues)) {
    variables[colorCategory][colorName] = {};

    if (!variables[colorCategory][colorName]["shades"])
      variables[colorCategory][colorName]["shades"] = {};

    let shades: { step: string; color: Rgb }[] = [];
    // Générer les nuances de couleurs
    shades = generateShades(colorHex);
    for (const shade of shades) {
      variables[colorCategory][colorName]["shades"][shade.step] =
        generateVariable("color", formatColorValue(shade.color), [
          SCOPES.COLOR.ALL,
        ]);
    }

    let r: number, g: number, b: number;
    ({ r, g, b } = shades.find((shade) => shade.step === "500")?.color!);
    generateOpacities(colorCategory, colorName, r, g, b);
  }
}

// Initialisation défensive pour neutral.grey.shades
if (!variables["neutral"]) variables["neutral"] = {};
if (!variables["neutral"]["grey"]) variables["neutral"]["grey"] = {};
if (!variables["neutral"]["grey"]["shades"])
  variables["neutral"]["grey"]["shades"] = {};
// Générer les variables de nuances de gris
for (const [step, shade] of Object.entries(greyShades)) {
  const { r, g, b } = shade;
  variables["neutral"]["grey"]["shades"][step] = generateVariable(
    "color",
    formatColorValue({ mode: "rgb", r: r / 255, g: g / 255, b: b / 255 }),
    [SCOPES.COLOR.ALL]
  );
}

// Générer les opacités pour grey, darkGrey et lightGrey
const { r: rG500, g: gG500, b: bG500 } = greyShades["500"];
generateOpacities("neutral", "grey", rG500 / 255, gG500 / 255, bG500 / 255);
const { r: rG950, g: gG950, b: bG950 } = greyShades["950"];
generateOpacities("neutral", "darkGrey", rG950 / 255, gG950 / 255, bG950 / 255);
const { r: rG50, g: gG50, b: bG50 } = greyShades["50"];
generateOpacities("neutral", "lightGrey", rG50 / 255, gG50 / 255, bG50 / 255);

// Collection Palette
const mode = "Value";
const collectionName = "Style/Colors/Palette";
export const paletteCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
