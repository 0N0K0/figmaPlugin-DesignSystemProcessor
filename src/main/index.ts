/**
 * Point d'entrée principal du plugin Figma
 */

import { createAllElevationEffects } from "./builders/styles/dropshadows";

figma.showUI(__html__, {
  width: 304,
  height: 99999,
  title: "Design System Processor",
  themeColors: true,
});

/**
 * Gère les messages provenant de l'UI
 */
figma.ui.onmessage = (msg) => {
  if (msg.type === "createElevations") {
    createAllElevationEffects();
  }
};
