import { Shadow } from "../../../types/stylesTypes";
import { hexToFigmaRgba } from "../../../utils/colorUtils";
import { styleBuilder } from "../styleBuilder";

/**
 * Génère les ombres pour les 24 niveaux d'élévation MUI
 *
 * X = 0;
 * Color = {
 *  layer 1 : "#00000010",
 *  layer 2 : "#00000015",
 *  layer 3 : "#00000020"
 * }
 *
 * for i = 1 ; i <= 24 ; i++
 *   layer 1 :
 *     Y = arrondi( i * 2.6)
 *     Blur = arrondi( i * 2)
 *     Spread = arrondi( i * 0.13)
 *   layer 2 :
 *     Y = i
 *     Blur = arrondi inférieur( i * 1.6)
 *     Spread = arrondi inférieur( i / 6.3)
 *   layer 3 :
 *     Y = arrondi( i / 2)
 *     Blur = arrondi supérieur( i * 1.65)
 *     Spread = -arrondi supérieur( i / -3.5)
 */

export async function generateElevationEffects(): Promise<void> {
  // Créer les 24 effect styles
  for (let level = 1; level <= 12; level++) {
    const shadows: Shadow[] = [
      {
        x: 0,
        y: Math.round(level * 2.6),
        blur: Math.round(level * 2),
        spread: Math.round(level * 0.13),
        color: "#00000010",
      },
      {
        x: 0,
        y: level,
        blur: Math.floor(level * 1.6),
        spread: Math.floor(level / 6.3),
        color: "#00000015",
      },
      {
        x: 0,
        y: Math.round(level / 2),
        blur: Math.ceil(level * 1.65),
        spread: -Math.ceil(level / -3.5),
        color: "#00000020",
      },
    ];

    const effects: Effect[] = shadows.map((shadow) => ({
      type: "DROP_SHADOW",
      visible: true,
      blendMode: "NORMAL",
      color: hexToFigmaRgba(shadow.color),
      offset: { x: shadow.x, y: shadow.y },
      radius: shadow.blur,
      spread: shadow.spread,
    }));

    // Créer le style d'effet
    await styleBuilder.createOrUpdateStyle(
      `Elevation/${level}`,
      "effect",
      effects,
    );
  }
}
