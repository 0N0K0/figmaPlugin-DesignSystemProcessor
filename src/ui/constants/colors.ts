import { hsl, formatHex } from "culori";

// Génération des couleurs
export const COLOR_DATA: Record<string, Record<string, string>> = {};

const hues: Record<string, number> = {
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

for (const [colorName, h] of Object.entries(hues)) {
  COLOR_DATA[colorName] = {};
  for (let s = 1; s >= 0.1; s -= 0.1) {
    const color = hsl({ mode: "hsl", h, s, l: 0.5 });
    COLOR_DATA[colorName][`s${s}`] = formatHex(color);
  }
}
if (!COLOR_DATA["grey"]) COLOR_DATA["grey"] = {};
const color = hsl({ mode: "hsl", h: 0, s: 0, l: 0.5 });
COLOR_DATA["grey"][`${String(color.l * 1000)}`] = formatHex(color);
