/**
 * Génère les palettes de couleurs et crée les variables Figma
 */

import { generateShades } from "../../../common/utils/colorUtils";
import { variableBuilder } from "./variableBuilder";
import { SCOPES } from "../../constants/variablesConstants";
import { ColorsCollection, VariableConfig } from "../../types/variablesTypes";
import { OPACITIES_STEPS } from "../../../common/constants/colorConstants";
import { converter } from "culori";
import { hexToFigmaRgba } from "../../utils/colorUtils";

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
				name: `${groupName}/${name}/${step}`,
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
				name: `${groupName}/${name}/opacity/${step}`,
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
	await variableBuilder.createVariables(colorVariables);

	console.log(
		"✅ Toutes les palettes de couleurs créées dans la collection Palette",
	);
}
