/**
 * Point d'entrée principal du plugin Figma
 */

import { generateElevationEffects } from "./builders/styles/dropshadows";

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
  if (msg.type === "generateBrandColors" || msg.type === "generatePalettes") {
    const { brandColors } = msg.data;
    /**
     * @TODO await generateBrandColorPalette(brandColors);
     * await generateBrandThemes(...);
     */
    figma.notify("✅ Palette de couleurs Brand générée avec succès");
  }

  if (
    msg.type === "generateFeedbackColors" ||
    msg.type === "generatePalettes"
  ) {
    const { feedbackColors } = msg.data;
    /**
     * @TODO await generateFeedbackColorPalette(feedbackColors);
     * await generateFeedbackThemes(...);
     */
    figma.notify("✅ Palette de couleurs Feedback générée avec succès");
  }

  if (msg.type === "generateNeutralColors" || msg.type === "generatePalettes") {
    const { neutralColors } = msg.data;
    /**
     * @TODO await generateNeutralColorPalette(neutralColors);
     */
    figma.notify("✅ Palette de couleurs Neutral générée avec succès");
  }

  if (msg.type === "generateThemes" || msg.type === "generatePalettes") {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateFeedbackThemes(...);
     */
    figma.notify("✅ Thèmes générés avec succès");
  }

  if (msg.type === "generateLayoutGuide") {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateLayoutGuide(...);
     */
    figma.notify("✅ Guide de mise en page généré avec succès");
  }

  if (msg.type === "generateRadius") {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateRadius(...);
     */
    figma.notify("✅ Radius générés avec succès");
  }

  if (msg.type === "generateFontSizes" || msg.type === "generateTypography") {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateRadius(...);
     */
    figma.notify("✅ Tailles de police générées avec succès");
  }

  if (
    msg.type === "generateFontFamilies" ||
    msg.type === "generateTypography"
  ) {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateFontFamilies(...);
     */
    figma.notify("✅ Familles de police générées avec succès");
  }

  if (msg.type === "generateTextDatas" || msg.type === "generateDatas") {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateTextDatas(...);
     */
    figma.notify("✅ Textes générés avec succès");
  }

  if (msg.type === "generateImagesDatas" || msg.type === "generateDatas") {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateImagesDatas(...);
     */
    figma.notify("✅ Images générées avec succès");
  }

  if (msg.type === "generateElevations") {
    generateElevationEffects();
  }
};
