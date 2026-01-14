/**
 * Interface pour le builder de variables
 */
export interface IVariableBuilder {
  getOrCreateCollection(name: string): Promise<VariableCollection>;
  createVariable(config: import("./variables").VariableConfig): Promise<Variable>;
  createVariables(configs: import("./variables").VariableConfig[]): Promise<Variable[]>;
  createColorVariables(
    collectionName: string,
    colors: Record<string, string>,
    options?: {
      hidden?: boolean;
      prefix?: string;
      scopes?: VariableScope[];
    }
  ): Promise<Variable[]>;
  createFloatVariables(
    collectionName: string,
    values: Record<string, number>,
    options?: {
      hidden?: boolean;
      prefix?: string;
      scopes?: VariableScope[];
    }
  ): Promise<Variable[]>;
  createStringVariables(
    collectionName: string,
    values: Record<string, string>,
    options?: {
      hidden?: boolean;
      prefix?: string;
      scopes?: VariableScope[];
    }
  ): Promise<Variable[]>;
  createBooleanVariables(
    collectionName: string,
    values: Record<string, boolean>,
    options?: {
      hidden?: boolean;
      prefix?: string;
    }
  ): Promise<Variable[]>;
  createHierarchicalVariables(
    collectionName: string,
    hierarchy: Record<string, Record<string, string | number>>,
    type?: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN",
    options?: {
      hidden?: boolean;
      scopes?: VariableScope[];
    }
  ): Promise<Variable[]>;
  getCollectionVariables(collectionName: string): Promise<Variable[]>;
  deleteVariable(collectionName: string, variableName: string): Promise<void>;
  deleteCollection(collectionName: string): Promise<void>;
  addModeToCollection(collectionName: string, modeName: string): Promise<string>;
  renameModeInCollection(
    collectionName: string,
    oldModeName: string,
    newModeName: string
  ): Promise<void>;
}
