/**
 * Configuration pour créer une variable Figma
 */
export interface VariableConfig {
  name: string;
  collection: string;
  type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  scopes?: VariableScope[];
  value?: VariableValue;
  hidden?: boolean;
  description?: string;
}

/**
 * Type pour une valeur de variable
 * Peut être une valeur simple ou une référence à une autre variable
 */
export type VariableValue = string | number | boolean | RGBA | VariableAlias;

/**
 * Référence à une autre variable
 */
export interface VariableAlias {
  type: "VARIABLE_ALIAS";
  id: string;
}
