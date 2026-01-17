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

const COLLECTION_NAME = "Style\\Colors\\Palette";
/**
 * Génère les shades pour un groupe de couleurs
 */
function generateColorGroup(
	colors: ColorsCollection,
	groupName: string,
): VariableConfig[] {
	const variables: VariableConfig[] = [];

	for (const [name, baseColor] of Object.entries(colors)) {
		const shades = generateShades(baseColor);
		shades.forEach(({ step, color }) => {
			variables.push({
				name: `${groupName}/${name}/shade/${step}`.toLowerCase(),
				collection: COLLECTION_NAME,
				type: "COLOR",
				value: color,
				scopes: [SCOPES.COLOR.ALL],
			});
		});

		const opacities = OPACITIES_STEPS.map((opacity) => {
			return {
				step: opacity,
				color: hexToFigmaRgba(baseColor, opacity / 1000),
			};
		});

		opacities.forEach(({ step, color }) => {
			variables.push({
				name: `${groupName}/${name}/opacity/${step}`.toLowerCase(),
				collection: COLLECTION_NAME,
				type: "COLOR",
				value: color,
				scopes: [SCOPES.COLOR.ALL],
			});
		});
	}

	return variables;
}

/**
 * Génère les palettes de couleurs pour Brand et Feedback dans une seule collection
 */
export async function generateColorPalette(
	colors: ColorsCollection,
	colorFamily: string,
): Promise<void> {
	const collection =
		await variableBuilder.getOrCreateCollection(COLLECTION_NAME);

	const colorVariables = generateColorGroup(colors, colorFamily);

	console.log(
		`🎨 Génération de ${
			Object.keys(colorVariables).length
		} variables de couleur...`,
	);

	// Crée toutes les variables dans une seule collection
	await variableBuilder.createOrUpdateVariables(colorVariables);

	console.log(
		"✅ Toutes les palettes de couleurs créées dans la collection Palette",
	);
}

/**
 * Génère la palette de couleurs Neutral
 */
export async function genrateNeutralPalette(
	greyHue: string | undefined,
): Promise<void> {
	try {
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

		console.log(
			`🎨 Génération de ${
				Object.keys(colorVariables).length
			} variables de couleur...`,
		);

		// Crée toutes les variables dans une seule collection
		await variableBuilder.createOrUpdateVariables(colorVariables);

		console.log(
			"✅ Toutes les palettes de couleurs créées dans la collection Palette",
		);
	} catch (error) {
		figma.notify(
			"❌ Erreur lors de la génération de la palette Neutral :" + error,
		);
	}
}
