/**
 * Point d'entrée principal du plugin Figma
 */

import { toPascalCase } from "../common/utils/textUtils";
import { generateElevationEffects } from "./builders/styles/dropshadowsBuilder";
import {
	generateColorPalette,
	genrateNeutralPalette,
} from "./builders/variables/styles/colors/PalettesBuilder";
import { generateColorThemes } from "./builders/variables/styles/colors/ThemesBuilder";
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
	logger.debug(`Message reçu: ${msg.type}`);

	const colorFamilies = ["brand", "feedback"];

	for (const key of colorFamilies) {
		if (
			msg.type === `generate${toPascalCase(key)}Colors` ||
			msg.type === "generatePalettes" ||
			msg.type === "generateAll"
		) {
			const colors = msg.datas?.colorsData?.[key];
			if (!colors) {
				logger.warn(`Aucune couleur de ${toPascalCase(key)} fournie`);
				return;
			}
			try {
				await generateColorPalette(colors, toPascalCase(key));
				logger.info(
					`Palette de couleurs de ${toPascalCase(key)} générée avec succès`,
				);
			} catch (error) {
				logger.error(`Erreur génération ${key}:`, error);
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
			logger.info("Palette de couleurs Neutral générée avec succès");
		} catch (error) {
			logger.error("Erreur génération Neutral:", error);
			return;
		}
	}

	if (
		msg.type === "generateThemes" ||
		msg.type === "generatePalettes" ||
		msg.type === "generateAll"
	) {
		logger.debug(
			`Clés disponibles dans msg.datas:`,
			Object.keys(msg.datas || {}),
		);
		for (const key of colorFamilies) {
			const coreThemes = msg.datas?.[`${key}CoreThemes`];
			const colors = msg.datas?.colorsData?.[key];
			logger.debug(`${key}CoreThemes=${!!coreThemes}, colors=${!!colors}`);
			if (coreThemes) {
				logger.debug(`${key}CoreThemes contenu:`, coreThemes);
			}
			if (coreThemes && colors) {
				try {
					await generateColorThemes(coreThemes, toPascalCase(key), colors);
					logger.info(
						`Thèmes de couleurs de ${toPascalCase(key)} générée avec succès`,
					);
				} catch (error) {
					logger.error(
						`Erreur lors de la génération des thèmes de ${toPascalCase(key)}:`,
						error,
					);
					return;
				}
			}
		}
		const themes = msg.datas?.themes;
		const neutralColors = msg.datas?.neutralColors;
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
