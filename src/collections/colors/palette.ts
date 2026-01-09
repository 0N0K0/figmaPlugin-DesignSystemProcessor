import { converter, Rgb } from "culori";
import { FigmaCollection, FigmaVariable } from "../../types";
import {
  formatColorValue,
  generateGreyShades,
  generateModeJson,
  generateShades,
  generateVariable,
} from "../../utils";
import { SCOPES, COLORS, COLOR_STEPS } from "../../constants";

// Récupérer les nuances de gris
const greyShades = generateGreyShades();

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
    if (colorCategory !== "neutral") {
      // Générer les nuances de couleurs
      shades = generateShades(colorHex);
      for (const shade of shades) {
        variables[colorCategory][colorName]["shades"][shade.step] =
          generateVariable("color", formatColorValue(shade.color), [
            SCOPES.COLOR.ALL,
          ]);
      }
    }

    // Générer les opacités
    if (!variables[colorCategory][colorName]["opacities"])
      variables[colorCategory][colorName]["opacities"] = {};

    if (colorName !== "white" && colorName !== "black") {
      let r: number, g: number, b: number;
      if (colorCategory !== "neutral") {
        ({ r, g, b } = shades.find((shade) => shade.step === "500")?.color!);
      } else {
        ({ r, g, b } = converter("rgb")(colorHex) as Rgb);
      }
      for (const step of COLOR_STEPS) {
        const a = parseInt(step) / 1000;
        const colorWithOpacity = { mode: "rgb" as const, r, g, b, alpha: a };
        variables[colorCategory][colorName]["opacities"][step] =
          generateVariable("color", formatColorValue(colorWithOpacity), [
            SCOPES.COLOR.ALL,
          ]);
      }
    }
  }
}

// Générer les variables de nuances de gris
for (const [step, shade] of Object.entries(greyShades)) {
  variables["neutral"]["grey"]["shades"][step] = generateVariable(
    "color",
    formatColorValue(shade),
    [SCOPES.COLOR.ALL]
  );
}

if (!variables["neutral"]) variables["neutral"] = {};

// Générer les opacités pour darkGrey
if (!variables["neutral"]["darkGrey"]) variables["neutral"]["darkGrey"] = {};
if (!variables["neutral"]["darkGrey"]["opacities"])
  variables["neutral"]["darkGrey"]["opacities"] = {};
const { h: hG50, s: sG50, l: lG50 } = greyShades["950"];
for (const step of COLOR_STEPS) {
  const a = parseInt(step) / 1000;
  const colorWithOpacity = {
    mode: "hsl" as const,
    h: hG50,
    s: sG50,
    l: lG50,
    alpha: a,
  };
  variables["neutral"]["darkGrey"]["opacities"][step] = generateVariable(
    "color",
    formatColorValue(colorWithOpacity),
    [SCOPES.COLOR.ALL]
  );
}

// Générer les opacités pour lightGrey
if (!variables["neutral"]["lightGrey"]) variables["neutral"]["lightGrey"] = {};
if (!variables["neutral"]["lightGrey"]["opacities"])
  variables["neutral"]["lightGrey"]["opacities"] = {};

const { h: hG950, s: sG950, l: lG950 } = greyShades["50"];
for (const step of COLOR_STEPS) {
  const a = parseInt(step) / 1000;
  const colorWithOpacity = {
    mode: "hsl" as const,
    h: hG950,
    s: sG950,
    l: lG950,
    alpha: a,
  };
  variables["neutral"]["lightGrey"]["opacities"][step] = generateVariable(
    "color",
    formatColorValue(colorWithOpacity),
    [SCOPES.COLOR.ALL]
  );
}

// Collection Palette
const mode = "value";
const collectionName = "Palette";
export const paletteCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
