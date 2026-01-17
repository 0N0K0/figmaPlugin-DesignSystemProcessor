/**
 * Génère les palettes de couleurs et crée les variables Figma
 */

import {
	generateGreyShades,
	generateShades,
} from "../../../../../common/utils/colorUtils";
import { variableBuilder } from "../../variableBuilder";
import { SCOPES } from "../../../../constants/variablesConstants";
import {
	ColorsCollection,
	VariableConfig,
} from "../../../../types/variablesTypes";
import {
	OPACITIES_STEPS,
	SHADE_STEPS,
} from "../../../../../common/constants/colorConstants";
import { hexToFigmaRgba } from "../../../../utils/colorUtils";
import { converter } from "culori";
import { logger } from "../../../../utils/logger";

const COLLECTION_NAME = "Style\\Colors\\Palette";

/**
 * Génère les palettes de couleurs pour Brand et Feedback dans une seule collection
 */
export async function generateColorPalette(
	colors: ColorsCollection,
	colorFamily: string,
): Promise<Variable[]> {
	const variables: VariableConfig[] = [];

	// Génère les nuances et opacités pour chaque couleur de base
	for (const [name, baseColor] of Object.entries(colors)) {
		// Génère les nuances
		const shades = generateShades(baseColor);
		shades.forEach(({ step, color }) => {
			variables.push({
				name: `${colorFamily}/${name}/shade/${step}`.toLowerCase(),
				collection: COLLECTION_NAME,
				type: "COLOR",
				value: color,
				scopes: [SCOPES.COLOR.ALL],
			});
		});

		// Génère les opacités
		const opacities = OPACITIES_STEPS.map((opacity) => {
			return {
				step: opacity,
				color: hexToFigmaRgba(baseColor, opacity / 1000),
			};
		});
		opacities.forEach(({ step, color }) => {
			variables.push({
				name: `${colorFamily}/${name}/opacity/${step}`.toLowerCase(),
				collection: COLLECTION_NAME,
				type: "COLOR",
				value: color,
				scopes: [SCOPES.COLOR.ALL],
			});
		});
	}

	logger.debug(
		`🎨 Génération de ${Object.keys(variables).length} variables de couleur...`,
	);

	// Crée toutes les variables dans une seule collection
	const newVariables = await variableBuilder.createOrUpdateVariables(variables);

	logger.info(
		"✅ Toutes les palettes de couleurs créées dans la collection Palette",
	);

	return newVariables;
}

/**
 * Génère la palette de couleurs Neutral
 */
export async function genrateNeutralPalette(
	greyHue: string | undefined,
): Promise<Variable[]> {
	let hue = 0;
	if (greyHue !== undefined && greyHue !== "") {
		hue = converter("hsl")(greyHue)?.h || 0;
	}
	const shades = generateGreyShades(SHADE_STEPS, hue);
	const colorVariables: VariableConfig[] = [];

	for (const [step, color] of Object.entries(shades)) {
		colorVariables.push({
			name: `neutral/grey/shade/${step}`,
			collection: COLLECTION_NAME,
			type: "COLOR",
			value: color,
			scopes: [SCOPES.COLOR.ALL],
		});
	}

	for (const key of ["grey", "lightGrey", "darkGrey"] as const) {
		const baseColor =
			shades[key === "grey" ? 500 : key === "lightGrey" ? 50 : 950];
		OPACITIES_STEPS.forEach((opacity) => {
			const color = hexToFigmaRgba(baseColor, opacity / 1000);
			colorVariables.push({
				name: `neutral/${key}/opacity/${opacity}`,
				collection: COLLECTION_NAME,
				type: "COLOR",
				value: color,
				scopes: [SCOPES.COLOR.ALL],
			});
		});
	}

	// Crée toutes les variables dans une seule collection
	const newVariables =
		await variableBuilder.createOrUpdateVariables(colorVariables);

	return newVariables;
}
