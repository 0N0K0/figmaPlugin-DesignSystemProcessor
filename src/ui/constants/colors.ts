import { hsl, formatHex, converter, clampChroma } from "culori";

// Génération des couleurs
export const COLOR_DATA: Record<string, Record<string, string>> = {};

const hues: Record<string, number> = {
  deepOrange: 20,
  orange: 30,
  amber: 40,
  yellow: 50,
  lime: 70,
  green: 110,
  teal: 150,
  cyan: 170,
  lightBlue: 190,
  blue: 210,
  indigo: 250,
  deepPurple: 270,
  purple: 290,
  fushia: 310,
  pink: 330,
  strawberry: 350,
  red: 10,
};

const huesOKLCH: Record<string, number> = Object.fromEntries(
  Object.entries(hues).map(([name, h]: [string, number]) => [
    name,
    converter("oklch")(formatHex({ mode: "hsl", h, s: 1, l: 0.5 }))!.h!,
  ])
);

// for (const [colorName, h] of Object.entries(hues)) {
// COLOR_DATA[colorName] = {};
// for (let s = 1; s >= 0.1; s -= 0.1) {
//   const color = hsl({ mode: "hsl", h, s, l: 0.5 });
//   COLOR_DATA[colorName][`s${s}`] = formatHex(color);
// }
// }

const correctedL: { [key: string]: number } = {
  deepOrange: 0.65,
  orange: 0.7,
  amber: 0.75,
  yellow: 0.8,
  lime: 0.78,
  green: 0.75,
  teal: 0.71,
  cyan: 0.69,
  lightBlue: 0.67,
  blue: 0.65,
  indigo: 0.62,
};

for (const [colorName, h] of Object.entries(huesOKLCH)) {
  COLOR_DATA[colorName] = {};
  for (let c = 0.2; c >= 0.02; c -= 0.02) {
    const lBase = correctedL[colorName] ?? 0.6;
    const l = Math.max((c / 0.2) * lBase, 0.6);
    const rgb = clampChroma(converter("rgb")({ mode: "oklch", l, c, h }));
    COLOR_DATA[colorName][`c${Math.round(c * 100)}`] = formatHex(rgb);
  }
}

if (!COLOR_DATA["grey"]) COLOR_DATA["grey"] = {};
const color = hsl({ mode: "hsl", h: 0, s: 0, l: 0.5 });
COLOR_DATA["grey"][`${String(color.l * 1000)}`] = formatHex(color);
