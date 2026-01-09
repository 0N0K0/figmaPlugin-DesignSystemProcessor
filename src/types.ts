/**
 * Valeur d'une couleur Figma
 */
export interface FigmaColorValue {
  colorSpace: "srgb";
  components: [number, number, number]; // r, g, b
  alpha: number;
  hex: string;
}

export type CoreShades = Record<"light" | "main" | "dark", FigmaVariable>;

/**
 * Interface pour une variable Figma
 */
export interface FigmaVariable {
  $type: "color" | "number" | "string"; // number for boolean
  $value: number | string | FigmaColorValue; // 0 | 1 for boolean; if alias in same collection, {groupeName.variableName}
  $extensions?: {
    "com.figma.scopes"?: string[];
    "com.figma.hiddenFromPublishing"?: boolean;
    "com.figma.type"?: "boolean" | "string";
    "com.figma.aliasdata"?: {
      targetVariableName: string; // {groupeName.variableName}
      targetVariableSetName: string; // collectionName
    };
  };
}

/**
 * Interface pour une collection de variables
 */
export interface FigmaCollection {
  name: string;
  modes: string[];
  variables: Record<string, string>;
}
