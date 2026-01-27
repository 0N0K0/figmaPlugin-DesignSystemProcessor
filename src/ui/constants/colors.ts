import { hsl, formatHex, converter, clampChroma } from "culori";
import { CORRECTED_L, HUES } from "../../common/constants/colorConstants";

// Génération des couleurs
export const COLOR_DATA: Record<string, Record<string, string>> = {};

const huesOKLCH: Record<string, number> = Object.fromEntries(
  Object.entries(HUES).map(([name, h]: [string, number]) => [
    name,
    converter("oklch")(formatHex({ mode: "hsl", h, s: 1, l: 0.5 }))!.h!,
  ]),
);

for (const [colorName, h] of Object.entries(huesOKLCH)) {
  COLOR_DATA[colorName] = {};
  for (let c = 0.2; c >= 0.02; c -= 0.02) {
    const lBase = CORRECTED_L[colorName] ?? 0.6;
    const l = Math.max((c / 0.2) * lBase, 0.6);
    const rgb = clampChroma(converter("rgb")({ mode: "oklch", l, c, h }));
    COLOR_DATA[colorName][`c${Math.round(c * 100)}`] = formatHex(rgb);
  }
}

if (!COLOR_DATA["grey"]) COLOR_DATA["grey"] = {};
const color = hsl({ mode: "hsl", h: 0, s: 0, l: 0.5 });
COLOR_DATA["grey"][`${String(color.l * 1000)}`] = formatHex(color);
