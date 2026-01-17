/**
 * Utilitaire pour créer des variables Figma
 * Simplifie la création de variables avec différents types, scopes et collections
 */

import type {
  VariableConfig,
  //   VariableValue,
  //   VariableAlias,
} from "../../types/variablesTypes";
import { SCOPES } from "../../constants/variablesConstants";
import { hexToFigmaRgba } from "../../utils/colorUtils";
// import { SCOPES } from "../../constants/variablesConstants";

export class VariableBuilder {
  private variables: Map<string, Variable> = new Map();

  /**
   * Obtient ou crée une collection de variables
   */
  async getOrCreateCollection(name: string): Promise<VariableCollection> {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const existing = collections.find((c) => c.name === name);
    if (existing) return existing;

    const collection = figma.variables.createVariableCollection(name);
    return collection;
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
      config.type
    );

    // Configure les scopes
    if (config.scopes && config.type !== "BOOLEAN") {
      variable.scopes = config.scopes;
    }

    // Défini la valeur (si fournie)
    if (config.value !== undefined) {
      try {
        const modeId = collection.modes[0]?.modeId;
        if (modeId) {
          // Gère les références à d'autres variables
          if (
            typeof config.value === "object" &&
            "type" in config.value &&
            config.value.type === "VARIABLE_ALIAS"
          ) {
            variable.setValueForMode(modeId, {
              type: "VARIABLE_ALIAS",
              id: config.value.id,
            });
          } else {
            // Convertit les valeurs hex en RGB pour les variables de couleur
            let valueToSet = config.value;
            if (config.type === "COLOR" && typeof config.value === "string") {
              valueToSet = hexToFigmaRgba(config.value);
            }
            variable.setValueForMode(modeId, valueToSet);
          }
        }
      } catch (error) {
        console.warn(
          `Erreur lors de la définition de la valeur pour ${varName}:`,
          error
        );
      }
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
   * Crée plusieurs variables
   */
  async createVariables(configs: VariableConfig[]): Promise<Variable[]> {
    const variables: Variable[] = [];
    for (const config of configs) {
      const variable = await this.createVariable(config);
      variables.push(variable);
    }
    return variables;
  }

  /**
   * Crée des variables de couleur
   */
  async createColorVariables(
    collectionName: string,
    colors: Record<string, string>,
    options?: {
      hidden?: boolean;
      prefix?: string;
      scopes?: VariableScope[];
    }
  ): Promise<Variable[]> {
    const scopes = options?.scopes || SCOPES.COLOR.ALL;
    const prefix = options?.prefix ? `${options.prefix}/` : "";

    return this.createVariables(
      Object.entries(colors).map(([name, value]) => ({
        name: `${prefix}${name}`,
        collection: collectionName,
        type: "COLOR",
        scopes: scopes as VariableScope[],
        value,
        hidden: options?.hidden ?? false,
      }))
    );
  }

  /**
   * Crée des variables numériques
   */
  async createFloatVariables(
    collectionName: string,
    values: Record<string, number>,
    options?: {
      hidden?: boolean;
      prefix?: string;
      scopes?: VariableScope[];
    }
  ): Promise<Variable[]> {
    const scopes = options?.scopes || SCOPES.FLOAT.ALL;
    const prefix = options?.prefix ? `${options.prefix}/` : "";

    return this.createVariables(
      Object.entries(values).map(([name, value]) => ({
        name: `${prefix}${name}`,
        collection: collectionName,
        type: "FLOAT",
        scopes: scopes as VariableScope[],
        value,
        hidden: options?.hidden ?? false,
      }))
    );
  }

  /**
   * Crée des variables texte
   */
  async createStringVariables(
    collectionName: string,
    values: Record<string, string>,
    options?: {
      hidden?: boolean;
      prefix?: string;
      scopes?: VariableScope[];
    }
  ): Promise<Variable[]> {
    const scopes = options?.scopes || SCOPES.STRING.ALL;
    const prefix = options?.prefix ? `${options.prefix}/` : "";

    return this.createVariables(
      Object.entries(values).map(([name, value]) => ({
        name: `${prefix}${name}`,
        collection: collectionName,
        type: "STRING",
        scopes: scopes as VariableScope[],
        value,
        hidden: options?.hidden ?? false,
      }))
    );
  }

  /**
   * Crée des variables booléennes
   */
  async createBooleanVariables(
    collectionName: string,
    values: Record<string, boolean>,
    options?: {
      hidden?: boolean;
      prefix?: string;
    }
  ): Promise<Variable[]> {
    const prefix = options?.prefix ? `${options.prefix}/` : "";

    return this.createVariables(
      Object.entries(values).map(([name, value]) => ({
        name: `${prefix}${name}`,
        collection: collectionName,
        type: "BOOLEAN",
        value,
        hidden: options?.hidden ?? false,
      }))
    );
  }

  /**
   * Crée des variables organisées hiérarchiquement
   */
  async createHierarchicalVariables(
    collectionName: string,
    hierarchy: Record<string, Record<string, string | number>>,
    type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN" = "COLOR",
    options?: {
      hidden?: boolean;
      scopes?: VariableScope[];
    }
  ): Promise<Variable[]> {
    const scopes =
      options?.scopes ||
      (type === "COLOR" ? SCOPES.COLOR.ALL : SCOPES.FLOAT.ALL);
    const configs: VariableConfig[] = [];

    for (const [category, values] of Object.entries(hierarchy)) {
      for (const [name, value] of Object.entries(values)) {
        configs.push({
          name: `${category}/${name}`,
          collection: collectionName,
          type,
          scopes: scopes as VariableScope[],
          value: value as string | number,
          hidden: options?.hidden ?? false,
        });
      }
    }

    return this.createVariables(configs);
  }

  /**
   * Ajoute un mode à une collection
   */
  async addModeToCollection(
    collectionName: string,
    modeName: string
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
    newModeName: string
  ): Promise<void> {
    const collection = await this.getOrCreateCollection(collectionName);
    const mode = collection.modes.find((m) => m.name === oldModeName);
    if (mode) {
      collection.renameMode(mode.modeId, newModeName);
    }
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
   * Trouve une variable par collection et nom
   */
  private async findVariable(
    collectionName: string,
    variableName: string
  ): Promise<Variable | undefined> {
    const cached = this.variables.get(`${collectionName}/${variableName}`);
    if (cached) return cached;

    const vars = await this.getCollectionVariables(collectionName);
    return vars.find((v) => v.name === variableName);
  }

  /**
   * Supprime une variable
   */
  async deleteVariable(
    collectionName: string,
    variableName: string
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
  async deleteCollection(collectionName: string): Promise<void> {
    const vars = await this.getCollectionVariables(collectionName);
    vars.forEach((v) => {
      v.remove();
      this.variables.delete(`${collectionName}/${v.name}`);
    });
  }
}

// Export singleton par défaut
export const variableBuilder = new VariableBuilder();
