/**
 * Point d'entrée principal du plugin Figma
 */

import { toPascalCase } from "../common/utils/textUtils";
import { generateElevationEffects } from "./builders/styles/dropshadowsBuilder";
import {
  generateColorPalette,
  genrateNeutralPalette,
} from "./builders/variables/styles/colors/PalettesBuilder";
import {
  generateColorThemes,
  generateNeutralThemes,
} from "./builders/variables/styles/colors/ThemesBuilder";
import { logger } from "./utils/logger";

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
  // Debug: afficher le type de message reçu
  const colorFamilies = ["brand", "feedback"];

  for (const key of colorFamilies) {
    if (
      msg.type === `generate${toPascalCase(key)}Colors` ||
      msg.type === "generatePalettes" ||
      msg.type === "generateAll"
    ) {
      const colors = msg.datas?.colorsData?.[key];
      if (!colors) {
        figma.notify(`⚠️ Aucune couleur de ${toPascalCase(key)} fournie`, {
          error: true,
        });
        return;
      }
      try {
        await generateColorPalette(colors, toPascalCase(key));
        figma.notify(
          `✅ Palette de couleurs de ${toPascalCase(key)} générée avec succès`,
        );
      } catch (error) {
        logger.error(`Erreur génération ${key}:`, error);
        figma.notify(
          `❌ Erreur lors de la génération de la palette de couleurs de ${toPascalCase(key)}`,
          {
            error: true,
          },
        );
        return;
      }
    }
  }
  if (
    msg.type === "generateNeutralColors" ||
    msg.type === "generatePalettes" ||
    msg.type === "generateAll"
  ) {
    const greyHue = msg.datas?.neutralColors?.greyHue;
    try {
      await genrateNeutralPalette(greyHue ?? "");
      figma.notify("✅ Palette de couleurs Neutral générée avec succès");
    } catch (error) {
      logger.error("Erreur génération Neutral:", error);
      figma.notify("❌ Erreur lors de la génération de la palette Neutral", {
        error: true,
      });
      return;
    }
  }

  if (
    msg.type === "generateThemes" ||
    msg.type === "generatePalettes" ||
    msg.type === "generateAll"
  ) {
    const themes = msg.datas?.themes;
    const neutralColors = msg.datas?.neutralColors;
    const greyHue = neutralColors?.greyHue;
    for (const key of colorFamilies) {
      const coreThemes = msg.datas?.[`${key}CoreThemes`];
      const colors = msg.datas?.colorsData?.[key];
      if (coreThemes && colors) {
        try {
          await generateColorThemes(
            coreThemes,
            themes,
            toPascalCase(key),
            colors,
            greyHue,
          );
          figma.notify(
            `✅ Thèmes de couleurs de ${toPascalCase(key)} générés avec succès`,
          );
        } catch (error) {
          logger.error(
            `Erreur lors de la génération des thèmes de ${toPascalCase(key)}:`,
            error,
          );
          figma.notify(
            `❌ Erreur lors de la génération des thèmes de ${toPascalCase(key)}`,
            {
              error: true,
            },
          );
          return;
        }
      }
    }
    if (neutralColors) {
      try {
        await generateNeutralThemes(neutralColors);
        figma.notify(`✅ Thèmes de couleurs Neutral générés avec succès`);
      } catch (error) {
        logger.error(`Erreur lors de la génération des thèmes Neutral:`, error);
        figma.notify(`❌ Erreur lors de la génération des thèmes Neutral`, {
          error: true,
        });
        return;
      }
    }

    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateFeedbackThemes(...);
     */
    // figma.notify("✅ Thèmes générés avec succès");
  }

  if (msg.type === "generateLayoutGuide" || msg.type === "generateAll") {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateLayoutGuide(...);
     */
    // figma.notify("✅ Guide de mise en page généré avec succès");
  }

  if (msg.type === "generateRadius" || msg.type === "generateAll") {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateRadius(...);
     */
    // figma.notify("✅ Radius générés avec succès");
  }

  if (
    msg.type === "generateFontSizes" ||
    msg.type === "generateTypography" ||
    msg.type === "generateAll"
  ) {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateRadius(...);
     */
    // figma.notify("✅ Tailles de police générées avec succès");
  }

  if (
    msg.type === "generateFontFamilies" ||
    msg.type === "generateTypography" ||
    msg.type === "generateAll"
  ) {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateFontFamilies(...);
     */
    // figma.notify("✅ Familles de police générées avec succès");
  }

  if (
    msg.type === "generateTextDatas" ||
    msg.type === "generateDatas" ||
    msg.type === "generateAll"
  ) {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateTextDatas(...);
     */
    // figma.notify("✅ Textes générés avec succès");
  }

  if (
    msg.type === "generateImagesDatas" ||
    msg.type === "generateDatas" ||
    msg.type === "generateAll"
  ) {
    /**
     * @TODO
     * const { ... } = msg.data;
     * await generateImagesDatas(...);
     */
    // figma.notify("✅ Images générées avec succès");
  }

  if (msg.type === "generateElevationsEffects" || msg.type === "generateAll") {
    generateElevationEffects();
  }
};
