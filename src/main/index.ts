/**
 * Point d'entrée principal du plugin Figma
 */

import { createAllElevationEffects } from "./builders/styles/dropshadows";
import { generateAllColorPalettes } from "./builders/variables/colorPalettes";

figma.showUI(__html__, {
  width: 304,
  height: 99999,
  title: "Design System Processor",
  themeColors: true,
});

/**
 * Gère les messages provenant de l'UI
 */
figma.ui.onmessage = async (msg) => {
  if (msg.type === "createElevations") {
    createAllElevationEffects();
  }

  if (msg.type === "generatePalettes") {
    const { brandColors, feedbackColors } = msg.data;
    await generateAllColorPalettes(brandColors, feedbackColors);
    figma.notify("✅ Palettes de couleurs générées avec succès");
  }
};
