/**
 * Point d'entrée principal du plugin Figma
 */

import { toPascalCase } from "../common/utils/textUtils";
import { generateElevationEffects } from "./builders/styles/DropshadowsBuilder";
import {
  generateColorPalette,
  generateNeutralPalette,
} from "./builders/variables/styles/colors/PalettesBuilder";
import {
  generateColorsThemesCollections,
  generateColorThemes,
  generateNeutralThemes,
} from "./builders/variables/styles/colors/ThemesBuilder";
import { generateRadius } from "./builders/variables/styles/RadiusBuilder";
import {
  generateBreakpoints,
  generateContentHeights,
  generateDensities,
  generateDevices,
  generateFontSizes,
} from "./builders/variables/DisplayContextBuilder";
import { logger } from "./utils/logger";
import { generateTypography } from "./builders/variables/styles/TypographyBuilder";
import { generateTextDatas } from "./builders/variables/TextDatasBuilder";
import { generateImagesComponents } from "./builders/components/ImagesBuilder";
import { generateGradients } from "./builders/styles/GradientsBuilder";
import { generateTypographyStyles } from "./builders/styles/TypographyBuilder";
import { generateViewportsPages } from "./builders/pages/ViewportsBuilder";

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
        if (key === "brand") await generateGradients(colors);
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
      await generateNeutralPalette(greyHue ?? "");
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
      if (coreThemes && colors && themes && greyHue) {
        try {
          await generateColorThemes(
            coreThemes,
            themes,
            toPascalCase(key),
            colors,
            greyHue,
          );
          await generateColorsThemesCollections(
            coreThemes,
            themes,
            toPascalCase(key),
            colors,
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
  }

  if (msg.type === "generateLayoutGuide" || msg.type === "generateAll") {
    const layoutGuide = msg.datas?.layoutGuide;
    if (layoutGuide === undefined) {
      figma.notify("⚠️ Aucune donnée de guide de mise en page fournie", {
        error: true,
      });
      return;
    } else {
      try {
        await generateBreakpoints(layoutGuide);
        await generateDensities(layoutGuide);
        await generateContentHeights(layoutGuide);
        await generateDevices(layoutGuide);
        figma.notify("✅ Guide de mise en page généré avec succès");
      } catch (error) {
        logger.error("Erreur génération du Guide de mise en page:", error);
        figma.notify(
          "❌ Erreur lors de la génération du Guide de mise en page",
          {
            error: true,
          },
        );
        return;
      }
    }
  }

  if (msg.type === "generateViewportsPages" || msg.type === "generateAll") {
    try {
      await generateViewportsPages();
      figma.notify("✅ Pages de présentations générées avec succès");
    } catch (error) {
      logger.error("Erreur génération des Pages de présentations:", error);
      figma.notify(
        "❌ Erreur lors de la génération des Pages de présentations",
        {
          error: true,
        },
      );
      return;
    }
  }

  if (msg.type === "generateRadius" || msg.type === "generateAll") {
    const radius = msg.datas?.radius;
    if (radius === undefined) {
      figma.notify("⚠️ Aucune donnée de radius fournie", { error: true });
      return;
    } else {
      try {
        await generateRadius(radius);
        figma.notify("✅ Radius générés avec succès");
      } catch (error) {
        logger.error("Erreur génération des Radius:", error);
        figma.notify("❌ Erreur lors de la génération des Radius", {
          error: true,
        });
        return;
      }
    }
  }

  if (
    msg.type === "generateFontSizes" ||
    msg.type === "generateTypography" ||
    msg.type === "generateAll"
  ) {
    const baseFontSize = msg.datas?.baseFontSize;
    if (baseFontSize === undefined) {
      figma.notify("⚠️ Aucune donnée de tailles de police fournie", {
        error: true,
      });
      return;
    } else {
      try {
        await generateFontSizes(baseFontSize);
        figma.notify("✅ Tailles de police générées avec succès");
      } catch (error) {
        logger.error("Erreur génération des tailles de police:", error);
        figma.notify("❌ Erreur lors de la génération des tailles de police", {
          error: true,
        });
        return;
      }
    }
  }

  if (
    msg.type === "generateFontStyles" ||
    msg.type === "generateTypography" ||
    msg.type === "generateAll"
  ) {
    const fontStyles = msg.datas?.fontStyles;
    const baseFontSize = msg.datas?.baseFontSize;
    const lineGrid = msg.datas?.lineGrid;
    if (fontStyles === undefined) {
      figma.notify("⚠️ Aucune donnée de styles de typographie fournie", {
        error: true,
      });
      return;
    } else {
      try {
        await generateTypography(fontStyles);
        await generateTypographyStyles(fontStyles, baseFontSize, lineGrid);
        figma.notify("✅ Styles de typographie générées avec succès");
      } catch (error) {
        logger.error("Erreur génération des styles de typographie:", error);
        figma.notify(
          "❌ Erreur lors de la génération des styles de typographie",
          {
            error: true,
          },
        );
        return;
      }
    }
  }

  if (
    msg.type === "generateTextDatas" ||
    msg.type === "generateDatas" ||
    msg.type === "generateAll"
  ) {
    logger.info(
      "Received generateTextDatas message:",
      msg.datas?.textDatasList,
    );
    const textDatas = msg.datas?.textDatasList;
    if (textDatas === undefined) {
      figma.notify(
        "⚠️ Aucune donnée de textes fournie, des données par défaut seront utilisées",
      );
      await generateTextDatas();
    } else {
      try {
        await generateTextDatas(textDatas);
        figma.notify("✅ Textes générés avec succès");
      } catch (error) {
        logger.error("Erreur lors de lagénération des textes:", error);
        figma.notify("❌ Erreur lors de la génération des textes", {
          error: true,
        });
        return;
      }
    }
  }

  if (
    msg.type === "generateImagesDatas" ||
    msg.type === "generateDatas" ||
    msg.type === "generateAll"
  ) {
    const imagesDatas = msg.datas?.imagesDatasList;
    const radiusDatas = msg.datas?.radius;
    if (imagesDatas === undefined) {
      figma.notify("⚠️ Aucune donnée d'images fournie fournie", {
        error: true,
      });
      return;
    } else {
      try {
        await generateImagesComponents(imagesDatas, radiusDatas);
        figma.notify("✅ Images générées avec succès");
      } catch (error) {
        logger.error("Erreur lors de la génération des images:", error);
        figma.notify("❌ Erreur lors de la génération des images", {
          error: true,
        });
        return;
      }
    }
  }

  if (msg.type === "generateElevationsEffects" || msg.type === "generateAll") {
    try {
      generateElevationEffects();
      figma.notify("✅ Élévations générées avec succès");
    } catch (error) {
      logger.error("Erreur lors de la génération des élévations :", error);
      figma.notify("❌ Erreur lors de la génération des élévations", {
        error: true,
      });
      return;
    }
  }
};
