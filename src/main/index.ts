/**
 * Point d'entrée principal du plugin Figma
 */

import { toPascalCase } from "../common/utils/textUtils";
import { generateElevationEffects } from "./builders/styles/dropshadowsBuilder";
import { generateColorPalette } from "./builders/variables/colorPalettesBuilder";

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
	for (const key of ["brand", "feedback"] as const) {
		if (
			msg.type === `generate${toPascalCase(key)}Colors` ||
			msg.type === "generatePalettes" ||
			msg.type === "generateAll"
		) {
			const colors = msg.data[`${key}Colors`];
			if (!colors) {
				figma.notify(`❌ Aucune couleur de ${toPascalCase(key)} fournie`);
				return;
			}
			try {
				await generateColorPalette(colors, toPascalCase(key));
				figma.notify(
					`✅ Palette de couleurs de ${toPascalCase(key)} générée avec succès`,
				);
			} catch (error) {
				figma.notify(
					`❌ Erreur lors de la génération des couleurs de ${toPascalCase(key)}`,
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
		const { neutralColors } = msg.data;
		/**
		 * @TODO await generateNeutralColorPalette(neutralColors);
		 */
		figma.notify("✅ Palette de couleurs Neutral générée avec succès");
	}

	if (
		msg.type === "generateThemes" ||
		msg.type === "generatePalettes" ||
		msg.type === "generateAll"
	) {
		/**
		 * @TODO
		 * const { ... } = msg.data;
		 * await generateFeedbackThemes(...);
		 */
		figma.notify("✅ Thèmes générés avec succès");
	}

	if (msg.type === "generateLayoutGuide" || msg.type === "generateAll") {
		/**
		 * @TODO
		 * const { ... } = msg.data;
		 * await generateLayoutGuide(...);
		 */
		figma.notify("✅ Guide de mise en page généré avec succès");
	}

	if (msg.type === "generateRadius" || msg.type === "generateAll") {
		/**
		 * @TODO
		 * const { ... } = msg.data;
		 * await generateRadius(...);
		 */
		figma.notify("✅ Radius générés avec succès");
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
		figma.notify("✅ Tailles de police générées avec succès");
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
		figma.notify("✅ Familles de police générées avec succès");
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
		figma.notify("✅ Textes générés avec succès");
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
		figma.notify("✅ Images générées avec succès");
	}

	if (msg.type === "generateElevationsEffects" || msg.type === "generateAll") {
		generateElevationEffects();
	}
};
