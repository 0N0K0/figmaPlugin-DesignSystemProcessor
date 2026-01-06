/**
 * Valeur d'une couleur Figma
 */
export interface FigmaColorValue {
  colorSpace: 'srgb';
  components: [number, number, number];
  alpha: number;
  hex: string;
}

/**
 * Interface pour une variable Figma
 */
export interface FigmaVariable {
  $type: 'color' | 'number' | 'string';
  $value: number | string | FigmaColorValue;
  $extensions: {
    'com.figma.scopes': string[];
    'com.figma.hiddenFromPublishing'?: boolean;
    'com.figma.type'?: 'boolean' | 'string';
  };
}

/**
 * Interface pour un mode d'une collection
 */
export interface FigmaMode {
  name: string;
  variables: Record<string, FigmaVariable>;
}

/**
 * Interface pour une collection de variables
 */
export interface FigmaCollection {
  name: string;
  modes: string[];
  variables: Record<string, string>;
}
