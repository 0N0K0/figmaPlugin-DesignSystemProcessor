/**
 * Configuration pour créer une variable Figma
 */
export interface VariableConfig {
	name: string;
	collection: string;
	type: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
	value?: VariableValue;
	alias?: string;
	mode?: string;
	scopes?: VariableScope[];
	hidden?: boolean;
	description?: string;
}

/**
 * Type pour une valeur de variable
 * Peut être une valeur simple ou une référence à une autre variable
 */
export type VariableValue = string | number | boolean | RGB | RGBA;

/**
 * Référence à une autre variable
 */
export type ColorsCollection = Record<string, string>;
