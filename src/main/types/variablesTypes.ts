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

export interface ElevationConfig {
  baseShade: number;
  altShade?: number;
  steps?: string[];
}

/**
 * Référence à une autre variable
 */
export type ColorsCollection = Record<string, string>;

export interface ModeConfig {
  columns: number;
  viewportWidth: { min: number; max: number };
  viewportHeight: Record<string, Record<string, Record<string, number>>>;
  contentWidth: Record<string, Record<string, Record<string, number>>>;
}

export type BreakpointsConfig = Record<
  string,
  {
    columns: number;
    viewportWidth: { min: number; max: number };
    viewportHeight: Record<string, Record<string, Record<string, number>>>;
    contentWidth: Record<string, Record<string, Record<string, number>>>;
  }
>;

// Types des modes de densité
export type DensitiesMode = "tight" | "compact" | "loose";

// Configuration des densités
export type DensitiesConfig = {
  tight: {
    minHeight: number;
    maxSpacing: number;
    positionSticky: boolean;
  };
  compact: {
    minHeight: number;
    maxSpacing: number;
    positionSticky: boolean;
  };
  loose: {
    minHeight: number;
    spacing: Record<string, number>;
    positionSticky: boolean;
  };
};
