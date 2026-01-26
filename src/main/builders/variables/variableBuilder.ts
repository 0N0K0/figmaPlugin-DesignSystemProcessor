/**
 * Utilitaire pour créer des variables Figma
 * Simplifie la création de variables avec différents types, scopes et collections
 */

import type { VariableConfig } from "../../types/variablesTypes";
import { hexToFigmaRgba } from "../../utils/colorUtils";
import { logger } from "../../utils/logger";

export class VariableBuilder {
  /**
   * Obtient une collection de variables par nom
   */
  async getCollection(name: string): Promise<VariableCollection | undefined> {
    try {
      const collections =
        await figma.variables.getLocalVariableCollectionsAsync();
      const collection = collections.find((c) => c.name === name);
      if (!collection) {
        logger.error(`[getCollection] Collection '${name}' introuvable.`);

        throw new Error(`Collection '${name}' introuvable.`);
      }
      logger.success(`[getCollection] Collection '${name}' trouvée.`);
      return collection;
    } catch (error) {
      logger.error(
        `[getCollection] Erreur lors de la récupération de la collection '${name}':`,
        error,
      );

      throw error;
    }
  }

  /**
   * Crée une nouvelle collection de variables
   */
  async createCollection(name: string): Promise<VariableCollection> {
    try {
      const collection = figma.variables.createVariableCollection(name);
      if (collection.modes.length === 0) {
        collection.addMode("Mode 1");
      }
      logger.success(`[createCollection] Collection '${name}' créée.`);

      return collection;
    } catch (error) {
      logger.error(
        `[createCollection] Erreur lors de la création de la collection '${name}':`,
        error,
      );

      throw error;
    }
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

  async getModesFromCollection(collectionName: string): Promise<
    {
      modeId: string;
      name: string;
    }[]
  > {
    try {
      const collection = await this.getCollection(collectionName);
      if (!collection) {
        return [];
      }
      const modes = collection.modes;
      if (modes.length === 0) {
        logger.warn(
          `[getModesFromCollection] Aucun mode trouvé dans la collection '${collectionName}'.`,
        );

        return [];
      }
      logger.success(
        `[getModesFromCollection] Modes de la collection '${collectionName}':`,
        modes,
      );

      return collection.modes;
    } catch (error) {
      logger.error(
        `[getModesFromCollection] Erreur lors de la récupération des modes de la collection '${collectionName}':`,
        error,
      );

      throw error;
    }
  }

  /**
   * Obtient un mode d'une collection par nom
   */
  async getModeFromCollection(
    collectionName: string,
    modeName: string,
  ): Promise<{
    mode: { modeId: string; name: string };
    collection: VariableCollection;
  }> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      const mode = collection.modes.find((m) => m.name === modeName);
      if (!mode) {
        logger.warn(
          `[getModeFromCollection] Mode '${modeName}' introuvable dans la collection '${collectionName}'.`,
        );

        return { mode: { modeId: "", name: "" }, collection };
      }
      logger.success(
        `[getModeFromCollection] Mode '${modeName}' trouvé dans la collection '${collectionName}'.`,
      );

      return {
        mode,
        collection,
      };
    } catch (error) {
      logger.error(
        `[getModeFromCollection] Erreur lors de la récupération du mode '${modeName}' de la collection '${collectionName}':`,
        error,
      );

      throw error;
    }
  }

  /**
   * Ajoute un mode à une collection
   */
  async addModeToCollection(
    collectionName: string,
    modeName: string,
  ): Promise<string> {
    try {
      const collection = await this.getOrCreateCollection(collectionName);
      const modeId = collection.addMode(modeName);
      logger.success(
        `[addModeToCollection] Mode '${modeName}' ajouté à la collection '${collectionName}'.`,
      );

      return modeId;
    } catch (error) {
      logger.error(
        `[addModeToCollection] Erreur lors de l'ajout du mode '${modeName}' à la collection '${collectionName}':`,
        error,
      );

      throw error;
    }
  }

  async getOrAddModeToCollection(
    collectionName: string,
    modeName: string,
  ): Promise<string> {
    const { mode } = await this.getModeFromCollection(collectionName, modeName);
    if (mode) {
      return mode.modeId;
    }
    return await this.addModeToCollection(collectionName, modeName);
  }

  /**
   * Supprime un mode d'une collection
   */
  async removeModeFromCollection(
    collectionName: string,
    modeName: string,
  ): Promise<void> {
    try {
      const { mode, collection } = await this.getModeFromCollection(
        collectionName,
        modeName,
      );
      if (!mode) {
        logger.warn(
          `[removeModeFromCollection] Le mode '${modeName}' n'existe pas dans la collection '${collectionName}'.`,
        );

        return;
      }
      collection.removeMode(mode.modeId);
      logger.success(
        `[removeModeFromCollection] Mode '${modeName}' supprimé de la collection '${collectionName}'.`,
      );
    } catch (error) {
      logger.error(
        `[removeModeFromCollection] Erreur lors de la suppression du mode '${modeName}' de la collection '${collectionName}':`,
        error,
      );

      throw error;
    }
  }

  /**
   * Trouve une variable par collection et nom (retourne une seule variable)
   */
  async findVariable(
    collectionName: string,
    variableName: string,
  ): Promise<Variable | undefined> {
    try {
      const variables = await this.getCollectionVariables(collectionName);
      const variable = variables.find((v) => v.name === variableName);
      if (!variable) {
        logger.warn(
          `[findVariable] Variable '${variableName}' introuvable dans la collection '${collectionName}'.`,
        );
        return;
      }
      logger.success(
        `[findVariable] Variable '${variableName}' trouvée dans la collection '${collectionName}'.`,
      );
      return variable;
    } catch (error) {
      logger.error(
        `[findVariable] Erreur lors de la recherche de la variable '${variableName}' dans la collection '${collectionName}':`,
        error,
      );
      throw error;
    }
  }

  async findVariables(
    collectionName: string,
    variableNames: string[],
  ): Promise<Variable[]> {
    const variables: Variable[] = [];
    for (const name of variableNames) {
      const variable = await this.findVariable(collectionName, name);
      if (variable) variables.push(variable);
    }
    return variables;
  }

  /**
   * Obtient toutes les variables d'une collection
   */
  async getCollectionVariables(collectionName: string): Promise<Variable[]> {
    const collection = await this.getCollection(collectionName);
    if (!collection) return [];

    try {
      const allVariables = await figma.variables.getLocalVariablesAsync();
      const variables = allVariables.filter(
        (v) => v.variableCollectionId === collection.id,
      );
      if (!variables || variables.length === 0) {
        logger.warn(
          `[getCollectionVariables] Aucune variable trouvée dans la collection '${collectionName}'.`,
        );
        return [];
      }
      logger.success(
        `[getCollectionVariables] Variables de la collection '${collectionName}' récupérées.`,
      );
      return variables;
    } catch (error) {
      logger.error(
        `[getCollectionVariables] Erreur lors de la récupération des variables de la collection '${collectionName}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Obtient toutes les variables d'une collection par groupe
   */
  async getCollectionVariablesByGroup(
    collectionName: string,
    groupName: string,
  ): Promise<Variable[]> {
    const collection = await this.getCollection(collectionName);
    if (!collection) return [];

    const allVariables = await figma.variables.getLocalVariablesAsync();
    const variables = allVariables.filter(
      (v) =>
        v.variableCollectionId === collection.id &&
        v.name.startsWith(`${groupName}/`),
    );
    if (!variables || variables.length === 0) {
      logger.warn(
        `[getCollectionVariablesByGroup] Aucune variable trouvée dans le groupe '${groupName}' de la collection '${collectionName}'.`,
      );

      return [];
    }
    logger.success(
      `[getCollectionVariablesByGroup] Variables du groupe '${groupName}' de la collection '${collectionName}' récupérées.`,
    );

    return variables;
  }

  // async getOrCreateCollectionVariablesByGroup(
  //   collectionName: string,
  //   groupName: string,
  //   configs: VariableConfig[],
  // ): Promise<Variable[]> {
  //   const existingVars = await this.getCollectionVariablesByGroup(
  //     collectionName,
  //     groupName,
  //   );
  //   if (existingVars.length > 0) {
  //     return existingVars;
  //   }

  //   return this.createVariables(configs);
  // }

  /**
   * Crée une variable
   */
  async createVariable(config: VariableConfig): Promise<Variable> {
    try {
      const collection = await this.getOrCreateCollection(config.collection);
      const varName = config.name;

      // Crée la variable avec le type spécifié
      const variable = figma.variables.createVariable(
        varName,
        collection,
        config.type,
      );
      logger.success(
        `[createVariable] Variable '${varName}' de type '${config.type}' créée dans la collection '${config.collection}'.`,
      );

      // Trouve ou crée le mode
      let modeId: string = collection.modes[0]?.modeId;
      if (config.mode) {
        modeId = await this.getOrAddModeToCollection(
          config.collection,
          config.mode,
        );
        await this.removeModeFromCollection(config.collection, "Mode 1");
      }

      // Définit les propriétés de la variable
      this.setVariableValue(variable, modeId, config.value, config.alias);
      if (config.scopes) this.setVariableScopes(variable, config.scopes);
      this.setVariableHiddenFromPublishing(variable, config.hidden ?? false);
      if (config.description)
        this.setVariableDescription(variable, config.description);

      return variable;
    } catch (error) {
      logger.error(
        `[createVariable] Erreur lors de la création de la variable '${config.name}' dans la collection '${config.collection}':`,
        error,
      );
      throw error;
    }
  }

  private setVariableValue(
    variable: Variable,
    modeId: string,
    value?: any,
    alias?: string,
  ) {
    if (value !== undefined) {
      // Convertit les valeurs hex en RGB pour les variables de couleur
      let valueToSet = value;
      if (variable.resolvedType === "COLOR" && typeof value === "string") {
        valueToSet = hexToFigmaRgba(value);
      }
      variable.setValueForMode(modeId, valueToSet);
      logger.success(
        `[setVariableValue] Valeur de la variable '${variable.name}' définie pour le mode '${modeId}':`,
        valueToSet,
      );
    }

    if (alias !== undefined) {
      variable.setValueForMode(modeId, {
        type: "VARIABLE_ALIAS",
        id: alias,
      });
      logger.success(
        `[setVariableValue] Alias de la variable '${variable.name}' défini pour le mode '${modeId}':`,
        alias,
      );
    }
  }

  private setVariableScopes(variable: Variable, scopes: VariableScope[]) {
    if (variable.resolvedType === "BOOLEAN") {
      logger.warn(
        `[setVariableScopes] Les variables de type BOOLEAN ne peuvent pas avoir de scopes. La variable '${variable.name}' ne sera pas modifiée.`,
      );
      return;
    }
    variable.scopes = scopes;
    logger.success(
      `[setVariableScopes] Scopes de la variable '${variable.name}' définis:`,
      scopes,
    );
  }

  private setVariableHiddenFromPublishing(variable: Variable, hidden: boolean) {
    variable.hiddenFromPublishing = hidden;
    logger.success(
      `[setVariableHiddenFromPublishing] Visibilité de la variable '${variable.name}' définie sur:`,
      hidden,
    );
  }

  private setVariableDescription(variable: Variable, description: string) {
    variable.description = description;
    logger.success(
      `[setVariableDescription] Description de la variable '${variable.name}' définie sur:`,
      description,
    );
  }

  /**
   * Crée plusieurs variables
   */
  // async createVariables(configs: VariableConfig[]): Promise<Variable[]> {
  //   const variables: Variable[] = [];
  //   for (const config of configs) {
  //     const variable = await this.createVariable(config);
  //     variables.push(variable);
  //   }
  //   return variables;
  // }

  /**
   * Crée ou met à jour une variable
   */
  async createOrUpdateVariable(config: VariableConfig): Promise<Variable> {
    try {
      const variable = await this.findVariable(config.collection, config.name);
      if (!variable) {
        logger.warn(
          `[createOrUpdateVariable] La variable '${config.name}' n'existe pas dans la collection '${config.collection}'. Elle sera créée.`,
        );
        const newVariable = await this.createVariable(config as VariableConfig);
        return newVariable;
      }

      if (config.type !== variable.resolvedType) {
        logger.warn(
          `[createOrUpdateVariable] Le type de la variable '${config.name}' ne peut pas être modifié de '${variable.resolvedType}' à '${config.type}'. La variable sera recréée.`,
        );
        await this.deleteVariable(config.collection, config.name);
        const newVariable = await this.createVariable(config as VariableConfig);
        return newVariable;
      }

      // Trouver le mode à mettre à jour
      const collection = await this.getOrCreateCollection(config.collection);
      let modeId: string = collection.modes[0]?.modeId;
      if (config.mode) {
        modeId = await this.getOrAddModeToCollection(
          config.collection,
          config.mode,
        );
      }

      if (
        (config.value || config.alias) &&
        modeId &&
        (config.value !== variable.valuesByMode[modeId!] ||
          config.alias !== variable.valuesByMode[modeId])
      )
        this.setVariableValue(variable, modeId, config.value, config.alias);

      if (config.scopes && config.scopes !== variable.scopes)
        this.setVariableScopes(variable, config.scopes);

      if (
        config.hidden !== undefined &&
        config.hidden !== variable.hiddenFromPublishing
      )
        this.setVariableHiddenFromPublishing(variable, config.hidden);

      if (
        config.description !== undefined &&
        config.description !== variable.description
      )
        this.setVariableDescription(variable, config.description);

      logger.success(
        `[createOrUpdateVariable] Variable '${config.name}' mise à jour dans la collection '${config.collection}'.`,
      );
      return variable;
    } catch (error) {
      logger.error(
        `[createOrUpdateVariable] Erreur lors de la mise à jour de la variable '${config.name}' dans la collection '${config.collection}':`,
        error,
      );
      throw error;
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
  // async createorUpdateHierarchicalVariables(
  //   collectionName: string,
  //   hierarchy: Record<string, any>,
  // ): Promise<Variable[]> {
  //   const configs: VariableConfig[] = [];

  //   /**
  //    * Vérifie si un objet est un VariableConfig
  //    */
  //   const isVariableConfig = (obj: any): obj is VariableConfig => {
  //     return (
  //       typeof obj === "object" &&
  //       obj !== null &&
  //       "type" in obj &&
  //       (obj.type === "COLOR" ||
  //         obj.type === "FLOAT" ||
  //         obj.type === "STRING" ||
  //         obj.type === "BOOLEAN")
  //     );
  //   };

  //   /**
  //    * Parcourt récursivement la hiérarchie pour extraire les variables
  //    */
  //   const extractVariables = (
  //     obj: Record<string, any>,
  //     path: string[] = [],
  //   ): void => {
  //     for (const [key, value] of Object.entries(obj)) {
  //       const currentPath = [...path, key];

  //       // Si c'est un VariableConfig, l'ajouter avec le chemin complet
  //       if (isVariableConfig(value)) {
  //         configs.push({
  //           ...value,
  //           name: currentPath.join("/"),
  //           collection: value.collection || collectionName,
  //         });
  //       }
  //       // Sinon, continuer à descendre dans la hiérarchie
  //       else if (typeof value === "object" && value !== null) {
  //         extractVariables(value, currentPath);
  //       }
  //     }
  //   };

  //   extractVariables(hierarchy);
  //   return this.createOrUpdateVariables(configs);
  // }

  /**
   * Supprime une variable
   */
  async deleteVariable(
    collectionName: string,
    variableName: string,
  ): Promise<void> {
    try {
      const variable = await this.findVariable(collectionName, variableName);
      if (!variable) {
        logger.warn(
          `[deleteVariable] Variable '${variableName}' introuvable dans la collection '${collectionName}'.`,
        );
        return;
      }
      variable.remove();
      logger.success(
        `[deleteVariable] Variable '${variableName}' supprimée de la collection '${collectionName}'.`,
      );
    } catch (error) {
      logger.error(
        `[deleteVariable] Erreur lors de la suppression de la variable '${variableName}' de la collection '${collectionName}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Supprime toutes les variables d'une collection
   */
  // async deleteCollectionVariables(collectionName: string): Promise<void> {
  //   const vars = await this.getCollectionVariables(collectionName);
  //   vars.forEach((v) => {
  //     v.remove();
  //     this.variables.delete(`${collectionName}/${v.name}`);
  //   });
  // }
}

// Export singleton par défaut
export const variableBuilder = new VariableBuilder();
