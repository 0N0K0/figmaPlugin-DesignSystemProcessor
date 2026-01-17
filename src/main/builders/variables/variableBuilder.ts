/**
 * Utilitaire pour créer des variables Figma
 * Simplifie la création de variables avec différents types, scopes et collections
 */

import type { VariableConfig } from "../../types/variablesTypes";
import { SCOPES } from "../../constants/variablesConstants";
import { hexToFigmaRgba } from "../../utils/colorUtils";

export class VariableBuilder {
	private variables: Map<string, Variable> = new Map();

	/**
	 * Obtient une collection de variables par nom
	 */
	async getCollection(name: string): Promise<VariableCollection | undefined> {
		const collections =
			await figma.variables.getLocalVariableCollectionsAsync();
		return collections.find((c) => c.name === name);
	}

	/**
	 * Crée une nouvelle collection de variables
	 */
	async createCollection(name: string): Promise<VariableCollection> {
		const collection = figma.variables.createVariableCollection(name);
		if (collection.modes.length === 0) {
			collection.addMode("Mode 1");
		}
		return collection;
	}

	/**
	 * Obtient ou crée une collection de variables
	 */
	async getOrCreateCollection(name: string): Promise<VariableCollection> {
		const existing = await this.getCollection(name);
		if (existing) return existing;

		const collection = await this.createCollection(name);
		return collection;
	}

	/**
	 * Obtient un mode d'une collection par nom
	 */
	async getModeFromCollection(
		collectionName: string,
		modeName: string,
	): Promise<{
		modeId: string;
		collection: VariableCollection;
	}> {
		const collection = await this.getOrCreateCollection(collectionName);
		const mode = collection.modes.find((m) => m.name === modeName);
		let modeId: string = mode ? mode.modeId : collection.addMode(modeName);
		return {
			modeId,
			collection,
		};
	}

	/**
	 * Ajoute un mode à une collection
	 */
	async addModeToCollection(
		collectionName: string,
		modeName: string,
	): Promise<string> {
		const collection = await this.getOrCreateCollection(collectionName);
		const mode = collection.addMode(modeName);
		return mode;
	}

	/**
	 * Renomme un mode d'une collection
	 */
	async renameModeInCollection(
		collectionName: string,
		oldModeName: string,
		newModeName: string,
	): Promise<void> {
		const { modeId, collection } = await this.getModeFromCollection(
			collectionName,
			oldModeName,
		);
		if (modeId) {
			collection.renameMode(modeId, newModeName);
		} else {
			await this.addModeToCollection(collectionName, newModeName);
		}
	}

	async removeModeFromCollection(
		collectionName: string,
		modeName: string,
	): Promise<void> {
		const { modeId, collection } = await this.getModeFromCollection(
			collectionName,
			modeName,
		);
		if (modeId) {
			collection.removeMode(modeId);
		}
	}

	/**
	 * Trouve une variable par collection et nom
	 */
	private async findVariable(
		collectionName: string,
		variableName: string,
	): Promise<Variable | undefined> {
		const cached = this.variables.get(`${collectionName}/${variableName}`);
		if (cached) return cached;

		const vars = await this.getCollectionVariables(collectionName);
		return vars.find((v) => v.name === variableName);
	}

	/**
	 * Obtient toutes les variables d'une collection
	 */
	async getCollectionVariables(collectionName: string): Promise<Variable[]> {
		const collections =
			await figma.variables.getLocalVariableCollectionsAsync();
		const collection = collections.find((c) => c.name === collectionName);
		if (!collection) return [];

		const variables = await figma.variables.getLocalVariablesAsync();
		return variables.filter((v) => v.variableCollectionId === collection.id);
	}

	/**
	 * Crée une variable
	 */
	async createVariable(config: VariableConfig): Promise<Variable> {
		const collection = await this.getOrCreateCollection(config.collection);
		const varName = config.name;

		// Crée la variable avec le type spécifié
		const variable = figma.variables.createVariable(
			varName,
			collection,
			config.type,
		);

		let modeId: string;
		if (config.mode) {
			const mode = await this.getModeFromCollection(
				config.collection,
				config.mode,
			);
			modeId = mode
				? mode.modeId
				: await this.addModeToCollection(config.collection, config.mode);
		} else {
			modeId = collection.modes[0]?.modeId;
		}

		// Défini la valeur
		if (config.value !== undefined) {
			try {
				// Convertit les valeurs hex en RGB pour les variables de couleur
				let valueToSet = config.value;
				if (config.type === "COLOR" && typeof config.value === "string") {
					valueToSet = hexToFigmaRgba(config.value);
				}
				variable.setValueForMode(modeId, valueToSet);
			} catch (error) {
				console.warn(
					`Erreur lors de la définition de la valeur pour ${varName}:`,
					error,
				);
			}
		}

		if (config.alias !== undefined) {
			try {
				variable.setValueForMode(modeId, {
					type: "VARIABLE_ALIAS",
					id: config.alias,
				});
			} catch (error) {
				console.warn(
					`Erreur lors de la définition de l'alias pour ${varName}:`,
					error,
				);
			}
		}

		// Configure les scopes
		if (config.scopes && config.type !== "BOOLEAN") {
			variable.scopes = config.scopes;
		}

		// Configure la visibilité
		variable.hiddenFromPublishing = config.hidden ?? false;

		// Configure la description
		if (config.description) {
			variable.description = config.description;
		}

		// Stocke la variable pour pouvoir la référencer
		this.variables.set(`${config.collection}/${varName}`, variable);

		return variable;
	}

	/**
	 * Met à jour une variable existante
	 */
	async updateVariable(config: VariableConfig): Promise<Variable | null> {
		const variable = await this.findVariable(config.collection, config.name);
		if (!variable) {
			const newVariable = await this.createVariable(config as VariableConfig);
			return newVariable;
		}

		if (config.type !== variable.resolvedType) {
			this.deleteVariable(config.collection, config.name);
			const newVariable = await this.createVariable(config as VariableConfig);
			return newVariable;
		}

		// Trouver le mode à mettre à jour
		const collection = await this.getOrCreateCollection(config.collection);
		let modeId: string;
		if (config.mode) {
			const mode = await this.getModeFromCollection(
				config.collection,
				config.mode,
			);
			modeId = mode
				? mode.modeId
				: await this.addModeToCollection(config.collection, config.mode);
		} else {
			modeId = collection.modes[0]?.modeId;
		}

		if (
			config.value &&
			modeId &&
			config.value !== variable.valuesByMode[modeId!]
		) {
			let valueToSet = config.value;
			if (config.type === "COLOR" && typeof config.value === "string") {
				valueToSet = hexToFigmaRgba(config.value);
			}
			variable.setValueForMode(modeId, valueToSet);
		}

		if (
			config.alias &&
			modeId &&
			config.alias !== variable.valuesByMode[modeId]
		) {
			variable.setValueForMode(modeId, {
				type: "VARIABLE_ALIAS",
				id: config.alias,
			});
		}

		if (
			config.scopes &&
			config.type !== "BOOLEAN" &&
			config.scopes !== variable.scopes
		) {
			variable.scopes = config.scopes;
		}

		if (
			config.hidden !== undefined &&
			config.hidden !== variable.hiddenFromPublishing
		) {
			variable.hiddenFromPublishing = config.hidden;
		}

		if (
			config.description !== undefined &&
			config.description !== variable.description
		) {
			variable.description = config.description;
		}

		return variable;
	}

	async createOrUpdateVariable(config: VariableConfig): Promise<Variable> {
		const existingVariable = await this.findVariable(
			config.collection,
			config.name,
		);
		if (existingVariable) {
			const updatedVariable = await this.updateVariable(config);
			return updatedVariable as Variable;
		} else {
			const newVariable = await this.createVariable(config);
			return newVariable;
		}
	}

	/**
	 * Crée ou met à jour plusieurs variables
	 */
	async createOrUpdateVariables(
		configs: VariableConfig[],
	): Promise<Variable[]> {
		const variables: Variable[] = [];
		for (const config of configs) {
			const variable = await this.createOrUpdateVariable(config);
			variables.push(variable);
		}
		return variables;
	}

	/**
	 * Crée ou met à jour des variables organisées hiérarchiquement
	 *
	 * @example
	 * { colors: { brand: { 500: { type: "COLOR", value: "#0DB9F2", scopes: [...] } } } }
	 * Résultat: colors/brand/500 comme nom de variable
	 */
	async createorUpdateHierarchicalVariables(
		collectionName: string,
		hierarchy: Record<string, any>,
	): Promise<Variable[]> {
		const configs: VariableConfig[] = [];

		/**
		 * Vérifie si un objet est un VariableConfig
		 */
		const isVariableConfig = (obj: any): obj is VariableConfig => {
			return (
				typeof obj === "object" &&
				obj !== null &&
				"type" in obj &&
				(obj.type === "COLOR" ||
					obj.type === "FLOAT" ||
					obj.type === "STRING" ||
					obj.type === "BOOLEAN")
			);
		};

		/**
		 * Parcourt récursivement la hiérarchie pour extraire les variables
		 */
		const extractVariables = (
			obj: Record<string, any>,
			path: string[] = [],
		): void => {
			for (const [key, value] of Object.entries(obj)) {
				const currentPath = [...path, key];

				// Si c'est un VariableConfig, l'ajouter avec le chemin complet
				if (isVariableConfig(value)) {
					configs.push({
						...value,
						name: currentPath.join("/"),
						collection: value.collection || collectionName,
					});
				}
				// Sinon, continuer à descendre dans la hiérarchie
				else if (typeof value === "object" && value !== null) {
					extractVariables(value, currentPath);
				}
			}
		};

		extractVariables(hierarchy);
		return this.createOrUpdateVariables(configs);
	}

	/**
	 * Supprime une variable
	 */
	async deleteVariable(
		collectionName: string,
		variableName: string,
	): Promise<void> {
		const variable = await this.findVariable(collectionName, variableName);
		if (variable) {
			variable.remove();
			this.variables.delete(`${collectionName}/${variableName}`);
		}
	}

	/**
	 * Supprime toutes les variables d'une collection
	 */
	async deleteCollectionVariables(collectionName: string): Promise<void> {
		const vars = await this.getCollectionVariables(collectionName);
		vars.forEach((v) => {
			v.remove();
			this.variables.delete(`${collectionName}/${v.name}`);
		});
	}
}

// Export singleton par défaut
export const variableBuilder = new VariableBuilder();
