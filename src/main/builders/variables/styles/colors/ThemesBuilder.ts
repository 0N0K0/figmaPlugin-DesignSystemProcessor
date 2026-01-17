import {
	ColorsCollection,
	VariableConfig,
} from "../../../../types/variablesTypes";
import { logger } from "../../../../utils/logger";
import { variableBuilder } from "../../variableBuilder";
import { generateColorPalette } from "./PalettesBuilder";

const COLLECTION_NAME = "Style\\Colors\\Themes";
const MODES = ["Light", "Dark"] as const;

export async function generateColorThemes(
	coreShades: Record<string, Record<string, number>>,
	colorFamily: string,
	colors: ColorsCollection,
): Promise<Variable[]> {
	const variables: VariableConfig[] = [];

	logger.debug(
		`generateColorThemes: colorFamily=${colorFamily}, categories=${Object.keys(coreShades).join(", ")}`,
	);

	for (const mode of MODES) {
		for (const [category, shades] of Object.entries(coreShades)) {
			for (const [shadeName, shadeValue] of Object.entries(shades)) {
				// Construire le nom de la variable cible dans la palette
				const targetVariableName =
					`${colorFamily}/${category}/shade/${shadeValue}`.toLowerCase();

				logger.debug(
					`Recherche: ${targetVariableName} (shade=${shadeName}, value=${shadeValue})`,
				);

				// Chercher ou créer la variable palette correspondante
				let targetVariable = await variableBuilder.findVariable(
					"Style\\Colors\\Palettes",
					targetVariableName,
				);

				if (!targetVariable) {
					// Si la variable n'existe pas, générer la palette
					logger.warn(
						`Variable palette non trouvée: ${targetVariableName}, génération de la palette...`,
					);
					const newVariables = await generateColorPalette(colors, colorFamily);
					targetVariable = newVariables.find(
						(v) => v.name === targetVariableName,
					);
				}

				// Créer la variable de thème avec alias vers la palette
				variables.push({
					name: `${colorFamily}/${category}/core/${shadeName}`.toLowerCase(),
					collection: COLLECTION_NAME,
					type: "COLOR",
					mode,
					alias: targetVariable?.id,
					value: targetVariable ? undefined : "#fff",
				});
			}
		}
	}

	logger.info(`${variables.length} variables de thème à créer`);

	const newVariables = await variableBuilder.createOrUpdateVariables(variables);

	logger.info(`${newVariables.length} variables de thème créées`);

	return newVariables;
}
