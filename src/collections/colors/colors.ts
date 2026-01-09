import { SCOPES } from "../../constants";
import { FigmaCollection, FigmaVariable } from "../../types";
import {
  formatColorValue,
  generateModeJson,
  generateVariable,
} from "../../utils";

const hues = {
  red: 10,
  deepOrange: 20,
  orange: 30,
  amber: 40,
  yellow: 50,
  lime: 70,
  lightGreen: 95,
  green: 125,
  teal: 150,
  cyan: 170,
  lightBlue: 190,
  blue: 210,
  deepBlue: 230,
  indigo: 250,
  deepPurple: 270,
  purple: 290,
  fushia: 310,
  pink: 330,
  strawberry: 350,
};

const variables: Record<string, Record<string, FigmaVariable>> = {};

for (let s = 100; s >= 10; s -= 10) {
  for (const [colorName, h] of Object.entries(hues)) {
    if (!variables[colorName]) variables[colorName] = {};
    variables[colorName][s.toString()] = generateVariable(
      "color",
      formatColorValue({ h: h, s: s, l: 50, a: 1 }),
      [SCOPES.COLOR.ALL]
    );
  }
}

const mode = "value";
const collectionName = "Colors";
export const colorsCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
